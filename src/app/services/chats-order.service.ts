import { ChatMemberDto } from './../dtos/ChatMemberDto';
import { UserService } from 'src/app/services/user.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatsOrderService {

  constructor(private userService:UserService) {

  }

  recalculateChatsOrder(sender:ChatMemberDto){
    const chat = this.userService.chats.find(x => x.id === sender.chatId)!;
    const member = chat
    .members.find(x => x.id === sender.id);
    member!.chatOrder = this.userService.chats.length - 1;
    let currentOrder = this.userService.chats.length - 2;
    for(let i = 0; i < this.userService.chats.length; ++i){
      if(this.userService.chats[i].id === sender.chatId){
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
