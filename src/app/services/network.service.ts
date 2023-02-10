import { MessageReceivedService } from './message-received.service';
import { ChatMemberDto } from '../dtos/ChatMemberDto';
import { JwtFacadeService } from './jwt-facade.service';
import { Observable } from 'rxjs';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { UserService } from './user.service';
import { Inject, Injectable, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChatDto } from 'src/app/dtos/ChatDto';
import * as signalR from '@microsoft/signalr';
import { MessageDto } from 'src/app/dtos/MessageDto';
import { UserJoinedDto } from 'src/app/dtos/UserJoinedDto';
import { MessageStatus } from '../enums/message-status';
import { Wrapper } from './wraper.service';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  connectUserTo(groups: ChatDto[]) {
    groups.forEach(e => this.connection?.invoke('JoinGroup', e.id.toString()));
  }
  private connection!: HubConnection | null;
  constructor(public userService:UserService, private jwt:JwtFacadeService,
    private messageReceivedService:MessageReceivedService) {
     
  }

  configureHub(){
    this.connection = new HubConnectionBuilder().withUrl(environment.signalR,
      {skipNegotiation:true, transport: signalR.HttpTransportType.WebSockets,
      accessTokenFactory: () => this.jwt.getAccessToken() || ''}
      )
    .build();
    this.connection?.start().then(() =>{
      this.connectUserTo(this.userService.chats.value);
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
  }

  disconnect(){
    this.connection?.stop().then(() => this.connection = null);
  }

  private userJoinedSetUp(){
    this.connection?.on("UserJoined", (dto:UserJoinedDto) =>{
      for(let i =0;i<this.userService.chats.value.length;++i){
        if(this.userService.chats.value[i].id === dto.groupId){
          this.userService.chats.value[i].members.push(dto.joinedMember);
        }
      }
    });
  }
  private chatCreatedSetUp() {
    this.connection?.on("ChatCreated", (createdChat: ChatDto) => {
      this.connection?.invoke("JoinGroup", createdChat.id.toString());
      const owner = createdChat.members.filter(x => x.role?.name == 'Owner')[0];
      if(owner.user.id === this.userService.currentUser.id){
        const chatIndex = this.userService.chats.value.findIndex(x => x.id === -1);
        this.userService.chats.value[chatIndex].id = createdChat.id;
        this.userService.chats.value[chatIndex].imageUrl = createdChat.imageUrl;
        this.userService.chats.value[chatIndex].members = createdChat.members;
        return;
      }

      this.userService.chats.value.unshift(createdChat);
    });
  }

  private privateChatCreatedSetUp(){
    this.connection?.on("PrivateChatCreated", (createChat:ChatDto) =>{
      this.connection?.invoke('JoinGroup', createChat.id.toString());
      this.userService.chats.value.unshift(createChat);
    });
  }

  private messageDeleted() {
    this.connection?.on("MessageDeleted", (deletedMessage: MessageDto) => {
      for (let i = 0; i < this.userService.chats.value.length; i++) {
        let index = 0;
        if (this.userService.chats.value[i].id === deletedMessage.chatId) {
          this.userService.chats.value[i].messages.forEach(element => {
            if (element.id === deletedMessage.id) {
              this.userService.chats.value[i].messages.splice(index, 1);
            }

            ++index;
          });
        }
      }
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
      const chat = this.userService.chats.value.find(x => x.id === message.chatId)!;
      if(message.sender.user.id === this.userService.currentUser.id){
        for(let i =chat.messages.length - 1;i >= 0; --i){
          if(chat.messages[i].id === -1){
            const message = chat.messages[i];
            message.id = message.id;
            message.status = MessageStatus.Delivered;
          }
        }
        
        return;
      }

      chat.messages.push(message);
      this.userService.chats.value = Array.prototype.concat(this.userService.chats.value);
      chat.messages =Array.prototype.concat(chat.messages);
      console.log('emiting');
      this.messageReceivedService.set[message.id].emit(message);
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
    this.connection?.on("UserRemoved", (memberId:number)=>{
      const chatIndex = this.userService.chats.value.findIndex(x => x.members.some(y => y.id === memberId));
      const memberIndex = this.userService.chats.value[chatIndex].members.findIndex(x => x.id === memberId);
      this.userService.chats.value[chatIndex].members.splice(memberIndex, 1);
    });
  }
}
