import { UserService } from '../../../services/user.service';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-chat-info',
  templateUrl: './chat-info.component.html',
  styleUrls: ['./chat-info.component.css']
})
export class ChatInfoComponent implements OnInit {

  constructor(public readonly userService:UserService) { }

  @Output() clickedEventEmmiter:EventEmitter<boolean> = new EventEmitter(); 

  ngOnInit(): void {
  }

  openGroupInfo:boolean = false;
  onClick(){
    this.openGroupInfo = !this.openGroupInfo;
    this.clickedEventEmmiter.emit(this.openGroupInfo);
  }

  isPrivateUserOnline(){
    const isOtherUserOnline = this.userService.selectedChat.value.usersOnlineIds
      .some(x => x != this.userService.currentUser.id);
    if(isOtherUserOnline){
      return 'online';
    }

    return 'last seen recently';
  }

  previousLength:number | null = null;
}
