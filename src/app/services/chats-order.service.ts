import { UserService } from 'src/app/services/user.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatsOrderService {

  constructor(private userService:UserService) {

  }

  recalculateChatsOrder(){
    const member = this.userService.selectedChat
    .members.find(x => x.id === this.userService.currentUserAsMember.id);
    member!.chatOrder = this.userService.chats.length - 1;
    let currentOrder = this.userService.chats.length - 2;
    for(let i =0;i<this.userService.chats.length;++i){
      if(this.userService.chats[i].id === this.userService.selectedChat.id){
        continue;
      }

      const currentMember = this.userService.chats[i]
      .members.find(x => x.user.id === this.userService.currentUser.id)!;
      if(currentMember){
        currentMember.chatOrder = currentOrder--;
      }
    }
  }
}
