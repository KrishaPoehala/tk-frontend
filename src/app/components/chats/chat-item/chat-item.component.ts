import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChatDto } from 'src/dtos/ChatDto';
import { UserDto } from 'src/dtos/UserDto';
import { HttpService } from 'src/app/services/http.service';
import { UserService } from 'src/app/services/user.service';
import { MessageStatus } from 'src/app/enums/message-status';

@Component({
  selector: 'app-chat-item',
  templateUrl: './chat-item.component.html',
  styleUrls: ['./chat-item.component.css']
})
export class ChatItemComponent implements OnInit {

  constructor(private chatService: HttpService,
    public readonly userService : UserService) { }

  ngOnInit(): void {
    this.setDisplayedValues();
    if(this.chat.id === -1){
      return;
    }

    this.chatService.getChatMessages(this.chat.id,this.userService.currentUser.id,0,20).subscribe(r => {
      r.forEach(element => {
        element.status = MessageStatus.Delivered;
        this.chat.messages.push(element);
      });
    });

  }
 

  messagesToLoad = 20;
  @Input() chat!: ChatDto;
  onClick(){
    this.userService.setSelectedChat(this.chat);
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