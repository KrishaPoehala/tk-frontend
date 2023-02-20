import { forkJoin, Observable } from 'rxjs';
import { NewMessageDto } from 'src/app/dtos/NewMessageDto';
import { ChatMemberDto } from './../../../dtos/ChatMemberDto';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, DoCheck } from '@angular/core';
import { ChatDto } from 'src/app/dtos/ChatDto';
import { UserDto } from 'src/app/dtos/UserDto';
import { HttpService } from 'src/app/services/http.service';
import { UserService } from 'src/app/services/user.service';
import { MessageStatus } from 'src/app/enums/message-status';
import { Wrapper } from 'src/app/services/wraper.service';
import { SelectedChatChangedService } from 'src/app/services/selected-chat-changed.service';
import { PresenceService } from 'src/app/services/presence.service';
import { MessageSentDto } from 'src/app/dtos/MessageSentDto';

@Component({
  selector: 'app-chat-item',
  templateUrl: './chat-item.component.html',
  styleUrls: ['./chat-item.component.css']
})
export class ChatItemComponent implements OnInit {

  constructor(private http: HttpService,
    public readonly userService : UserService,private selectedChatService:SelectedChatChangedService) { }

  ngOnInit(): void {
    if(!this.chat || this.chat.id === -1){
      return;
    }

    this.setDisplayedValues();
    this.http.getChatMessages(this.chat.id,this.userService.currentUser.id,0,20,false).subscribe(r => {
      r.forEach(element => {
        const isCurrentMessage = element.sender.user.id === this.userService.currentUser.id;
        if((!isCurrentMessage && (!element.readBy || !element.readBy?.some(x => x.user.id === this.userService.currentUser.id)))){
          console.log(this.chat.members);
          const member = this.chat.members.find(x => x.user.id === this.userService.currentUser.id)!;
          if(!member){
            return;
          }
          if(!member.unreadMessagesLength || isNaN(member.unreadMessagesLength)){
            member.unreadMessagesLength = 1;
          }
          else{
            member.unreadMessagesLength++;
          }
          
        }
        else if(element.isSeen){
          element.status = MessageStatus.Seen;
        }
        else if(isCurrentMessage){
          element.status = MessageStatus.Delivered;
        }

        this.chat.messages.push(element);
      });
      
      this.chat.members = Array.prototype.concat(this.chat.members);
      this.userService.chats.value = Array.prototype.concat(this.userService.chats.value);
    });
  }
 
  getUnreadMessage(members:ChatMemberDto[]){
    const u = members.find(x => x.user.id === this.userService.currentUser.id);
    if(!u){
      return 0;
    }

    return u!.unreadMessagesLength;
  }

  messagesToLoad = 20;
  @Input() chat!: ChatDto;
  onClick(){
    if(this.userService.selectedChat?.value.id === this.chat.id){
      return;
    }

    this.userService.setSelectedChat(this.chat);
    setTimeout(() => {
      this.selectedChatService.chatSelectionChangedEmitter.emit(new MessageSentDto(this.chat,true));
    }, 20);
  } 

  displayedImageUrl!:string;
  displayedGroupName!:string;
  getUserOnTheOtherSide(){
    let userOnTheOtherSide :UserDto | null = null;
    for(let i = 0; i< this.chat.members.length;++i){
      if(this.chat.members[i].user.id != this.userService.currentUser.id){
        userOnTheOtherSide = this.chat.members[i].user;
      }
    }

    return userOnTheOtherSide;
  }
  setDisplayedValues(){
    if(this.chat?.isGroup === false){
      const userOnTheOtherSide = this.getUserOnTheOtherSide();
      this.displayedGroupName = userOnTheOtherSide?.name || "";
      this.displayedImageUrl = userOnTheOtherSide?.profilePhotoUrl || "";
      return;
    }

    this.displayedGroupName = this.chat?.name || "";
    this.displayedImageUrl = this.chat?.imageUrl || "";
  }

}
