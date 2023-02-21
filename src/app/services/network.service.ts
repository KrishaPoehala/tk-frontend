import { HttpService } from './http.service';
import { UnreadMessagesService } from './unread-messages.service';
import { ChatCreatedService } from './chat-created.service';
import { MessagesListComponent } from './../components/messages/messages-list/messages-list.component';
import { CursorPositionsService } from './cursor-positions.service';
import { ChatMemberDto } from '../dtos/ChatMemberDto';
import { JwtFacadeService } from './jwt-facade.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { UserService } from './user.service';
import { Inject, Injectable, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChatDto } from 'src/app/dtos/ChatDto';
import * as signalR from '@microsoft/signalr';
import { MessageDto } from 'src/app/dtos/MessageDto';
import { UserJoinedDto } from 'src/app/dtos/UserJoinedDto';
import { MessageStatus } from '../enums/message-status';
import { SelectedChatChangedService } from './selected-chat-changed.service';
import { MessageSentDto } from '../dtos/MessageSentDto';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  
  private connection!: HubConnection | null;
  constructor(public userService:UserService, private jwt:JwtFacadeService,
    private cursorPositions:CursorPositionsService,
    private chatCreated:ChatCreatedService, private selectedChat: SelectedChatChangedService,
    private http:HttpService) {
    }
    
  async connectUserTo(groups: ChatDto[]) {  
    const list:Promise<any>[] = [];
    groups.forEach(async x => {
      list.push(this.connection?.invoke('JoinGroup', x.id.toString())!);
      await this.setOnlineUsersFor(x);
    });
    await Promise.all(list)
    await this.connection?.invoke('NotifyUserConnected', groups.map(x => x.id.toString()));
  }

  async setOnlineUsersFor(chat: ChatDto) {
    chat.usersOnlineIds = await this.connection?.invoke<string[]>('GetOnlineUsers', chat)!;
  }
  async isOnline(userId:string){
    const isOnline = await this.connection?.invoke<boolean>('IsOnline', userId.toString());
    return isOnline as boolean;
  }

  configureHub(){
    this.connection = new HubConnectionBuilder().withUrl(environment.signalR,
      {skipNegotiation:true, transport: signalR.HttpTransportType.WebSockets,
      accessTokenFactory: () => this.jwt.getAccessToken() || ''}
      )
    .build();
    const startConnectionPromise = this.connection?.start().then(async () =>{
      await this.connectUserTo(this.userService.chats.value);
    });

    this.messageSentSetUp();
    this.messageEditedSetUp();
    this.messageDeleted();
    this.chatCreatedSetUp();
    this.privateChatCreatedSetUp();
    this.userJoinedSetUp();
    this.memberPromotedSetUp();
    this.permissionsChangedSetUp();
    this.userRemovedSetUp();
    this.userConnectedSetUp();
    this.userDisconnectedSetUp();
    this.messagesReadSentUp();
    return startConnectionPromise;
  }
  userDisconnectedSetUp() {
    this.connection?.on('UserDisconnected', (userId: string) => {
        this.userService.chats.value.forEach(x => {
          if(!x.members.some(m => m.user.id === userId)){
            return;
          }
          
          const userIndex = x.usersOnlineIds.findIndex(x => x === userId);
          x.usersOnlineIds.splice(userIndex,1);
          x.usersOnlineIds = Array.prototype.concat(x.usersOnlineIds);
      })
    });
  }

  async connectNewUserTo(userId:string, chatId:string){
    return await this.connection?.invoke('NotifyNewUserConnected', chatId.toString(), userId);
  }

  userConnectedSetUp() {
    this.connection?.on('UserConnected', ({userId, groupId}) => {
      if(userId === this.userService.currentUser.id){
        return;
      }

      const chat = this.userService.chats.value.find(x => x.id === groupId)!;
      if(!chat.usersOnlineIds){
        chat.usersOnlineIds = [userId];
        return;
      }

      chat.usersOnlineIds.push(userId);
    });
  }

  disconnect(){
    this.connection?.stop().then(() => this.connection = null);
  }

  private userJoinedSetUp(){
    this.connection?.on("UserJoined", (dto:UserJoinedDto) =>{
      for(let i =0;i<this.userService.chats.value.length;++i){
        if(this.userService.chats.value[i].id === dto.groupId){
          const chat = this.userService.chats.value[i];
          const userToRemoveIndex = chat.members
          .findIndex(x => x.id === '');
          chat.members.splice(userToRemoveIndex, 1);
          chat.members.push(dto.joinedMember);
        }
      }
    });
  }

  private chatCreatedSetUp() {
    this.connection?.on("ChatCreated", async (createdChat: ChatDto) => {
      await this.chatCreateHandler(createdChat);
    });
  }

  private async chatCreateHandler(createdChat: ChatDto) {
    this.connection?.invoke("JoinGroup", createdChat.id.toString());
    await this.setOnlineUsersFor(createdChat);
    this.connection?.invoke('NotifyUserConnected', [createdChat.id.toString()]);
    this.userService.chats.value.unshift(createdChat);
    //this.selectedChatService.add(createdChat.id);
    this.userService.setfirstChatAsSelected(0);
    this.chatCreated.chatCreatedEmmiter.emit(createdChat);
  }

  private privateChatCreatedSetUp(){
    this.connection?.on("PrivateChatCreated", async (createdChat:ChatDto) =>{
     await this.chatCreateHandler(createdChat);
    });
  }

  private messageDeleted() {
    this.connection?.on("MessageDeleted", (deletedMessage: MessageDto) => {
      const chat = this.userService.chats.value.find(x => x.id === deletedMessage.chatId)!;
      const messageIndex = chat.messages.findIndex(x => x.id === deletedMessage.id);
      if(messageIndex === -1){
        return;
      }

      chat.messages.splice(messageIndex, 1);
      chat.messages = Array.prototype.concat(chat.messages);
    });
  }

  private messageEditedSetUp() {
    this.connection?.on("MessageEdited", (message: MessageDto) => {
      const chatIndex = this.userService.chats.value.findIndex(x => x.id === message.chatId);
      const messageIndex = this.userService.chats.value[chatIndex].messages.findIndex(x => x.id == message.id);
      this.userService.chats.value[chatIndex].messages[messageIndex].text = message.text;
    });
  }

  private messageSentSetUp() {
    this.connection?.on("MessageSent", (message: MessageDto) => {
      console.log(message);
      const chat = this.userService.chats.value.find(x => x.id === message.chatId)!;
      if(message.sender.user.id === this.userService.currentUser.id){
        for(let i =chat.messages.length - 1;i >= 0; --i){
          if(chat.messages[i].id === ''){
            message.status = MessageStatus.Delivered;
            chat.messages.splice(i, 1, message);
            return;
          }
        }
        return;
      }

      const atBottom = this.cursorPositions.isAtTheBottom(chat.id);
      const isCurrent = this.userService.selectedChat !== undefined 
      && chat.id === this.userService.selectedChat?.id;
      const member = chat.members.find(x => x.user.id === this.userService.currentUser.id)!;
      if(isCurrent === false || (isCurrent === true && atBottom === false)){
        if(isNaN(member.unreadMessagesLength)){
          member.unreadMessagesLength = 1;
        }
        else{
          member.unreadMessagesLength += 1;
        }  
        
        chat.members = Array.prototype.concat(chat.members);
        if(isCurrent === true && atBottom === false){
          this.selectedChat.chatSelectionChangedEmitter.emit(new MessageSentDto(chat,false));
        }
      }
      
      chat.messages.push(message);
      this.userService.chats.value = Array.prototype.concat(this.userService.chats.value);
      chat.messages = Array.prototype.concat(chat.messages);

      if(isCurrent === true && atBottom){
        this.http.saveReadMessages(member.id, [message]).subscribe();
      }
    });
  }

  private memberPromotedSetUp(){
    this.connection?.on('MemberPromoted', (member:ChatMemberDto) => {
      const chatIndex = this.userService.chats.value.findIndex(x => x.id === member.chatId);
      const memberIndex = this.userService.chats.value[chatIndex].members.findIndex(x => x.id === member.id);
      this.userService.chats.value[chatIndex].members[memberIndex].permissions = member.permissions;
      this.userService.chats.value[chatIndex].members[memberIndex].role = member.role;
    });
  }
  
  private permissionsChangedSetUp(){
    this.connection?.on("PermissionsChanged", (member:ChatMemberDto) => {
      const chatIndex = this.userService.chats.value.findIndex(x => x.id === member.chatId);
      const memberIndex = this.userService.chats.value[chatIndex].members.findIndex(x => x.id === member.id);
      this.userService.chats.value[chatIndex].members[memberIndex].permissions = member.permissions;
    });
  }

  private userRemovedSetUp(){
    this.connection?.on("UserRemoved", (memberId:string)=>{
      const chatIndex = this.userService.chats.value.findIndex(x => x.members.some(y => y.id === memberId));
      const memberIndex = this.userService.chats.value[chatIndex].members.findIndex(x => x.id === memberId);
      this.userService.chats.value[chatIndex].members.splice(memberIndex, 1);
      if(this.userService.currentUserAsMember.id === memberId){
        this.userService.selectedChat = null;
      }
    });
  }

  private messagesReadSentUp(){
    this.connection?.on('MessagesRead',({chatId,memberId,messageIds}) =>{
      const chat = this.userService.chats.value.find(x => x.id === chatId)!;
      const member = chat.members.find(x => x.id === memberId)!;
      messageIds.forEach((id:string) => {
        const messageIndex = chat.messages.findIndex(x => x.id === id);
        chat.messages[messageIndex].status = MessageStatus.Seen;
        chat.messages[messageIndex].isSeen = true;
        if(chat.messages[messageIndex].readBy){
          chat.messages[messageIndex].readBy?.push(member);
        }
        else{
          chat.messages[messageIndex].readBy = [member];
        }

        chat.messages[messageIndex].readBy = Array.prototype.concat(chat.messages[messageIndex].readBy);
      });
    });
  }
}
