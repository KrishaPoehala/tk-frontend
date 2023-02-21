import { ChatDto } from 'src/app/dtos/ChatDto';
import { NetworkService } from './network.service';
import { ChatMemberDto } from './../dtos/ChatMemberDto';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  constructor(private network:NetworkService) { }

  setNewMembersPresence(chat:ChatDto,newMemberIds: string[]) {
    if(!chat.usersOnlineIds){
      chat.usersOnlineIds = [];
    }

    newMemberIds.forEach(async m => {
      const isOnline = await this.network.isOnline(m);
      if(isOnline){
        chat.usersOnlineIds.push(m);
      }
    });

    chat.usersOnlineIds = Array.prototype.concat(chat.usersOnlineIds);
  }


  setOnlineMembers(chat:ChatDto){
    if(!chat.usersOnlineIds){
      chat.usersOnlineIds = [];
    }

    chat.members.forEach(async x => {
      const isOnline = await this.network.isOnline(x.user.id);
      if(isOnline){
        chat.usersOnlineIds.push(x.user.id);
      }
    });

    chat.usersOnlineIds = Array.prototype.concat(chat.usersOnlineIds);
  }
}
