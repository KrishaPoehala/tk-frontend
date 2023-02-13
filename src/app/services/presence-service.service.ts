import { UserService } from './user.service';
import { ChatMemberDto } from './../dtos/ChatMemberDto';
import { NetworkService } from './network.service';
import { ChatDto } from 'src/app/dtos/ChatDto';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PresenceServiceService {

  constructor(private  userService:UserService,private network:NetworkService) { }

  previousIntervalId:NodeJS.Timer | null = null;
  setOnlineUsersForCurrentChat(){
    if(this.previousIntervalId){
      clearInterval(this.previousIntervalId);
    }

    this.previousIntervalId =  setInterval(() => {
    const onlineUsers:ChatMemberDto[] = [];
    this.userService.selectedChat.value.members.forEach(async m =>{
      if(await this.network.isOnline(m.user.id)){
        onlineUsers.push(m);
      }
    });

      this.userService.selectedChat.value.usersOnline = onlineUsers;
    }, 1000)
  }
}
