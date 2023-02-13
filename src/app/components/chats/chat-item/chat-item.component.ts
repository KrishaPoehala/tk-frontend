import { PresenceServiceService as PresenceService } from './../../../services/presence-service.service';
import { ChatMemberDto } from './../../../dtos/ChatMemberDto';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges, DoCheck } from '@angular/core';
import { ChatDto } from 'src/app/dtos/ChatDto';
import { UserDto } from 'src/app/dtos/UserDto';
import { HttpService } from 'src/app/services/http.service';
import { UserService } from 'src/app/services/user.service';
import { MessageStatus } from 'src/app/enums/message-status';
import { Wrapper } from 'src/app/services/wraper.service';
import { SelectedChatChangedService } from 'src/app/services/selected-chat-changed.service';

@Component({
  selector: 'app-chat-item',
  templateUrl: './chat-item.component.html',
  styleUrls: ['./chat-item.component.css']
})
export class ChatItemComponent implements OnInit {

  constructor(private http: HttpService,
    public readonly userService : UserService,private selectedChatService:SelectedChatChangedService,
    private presenceService:PresenceService) { }

  ngOnInit(): void {
    console.log(this.chat.usersOnline);
    if(!this.chat || this.chat.id === -1){
      return;
    }
    
    this.setDisplayedValues();
    this.http.getChatMessages(this.chat.id,this.userService.currentUser.id,0,20).subscribe(r => {
      r.forEach(element => {
        element.status = MessageStatus.Delivered;
        this.chat.messages.push(element);
      });

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
    this.userService.setSelectedChat(this.chat);
    this.presenceService.setOnlineUsersForCurrentChat();
    setTimeout(() => this.selectedChatService.set[this.chat.id].emit(this.chat), 20);
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
