import { Roles } from './../enums/roles';
import { UserService } from 'src/app/services/user.service';
import { ChatMemberDto } from './../../dtos/ChatMemberDto';
import { MessageDto } from 'src/dtos/MessageDto';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  constructor(private userService:UserService) { }

  hasPermissionForEditing(message: MessageDto){
    if(message.sender.user.id !== this.userService.currentUser.id){
      return false;
    }
    
    return true;
  }

  hasPermissionForDeleting(chatMember:ChatMemberDto|undefined, message: MessageDto){
    if(!chatMember){
      return false;
    }

    if(!chatMember.role || !message.sender.role){
      return true;
    }
    
    if(chatMember.role?.order > message.sender.role?.order){
      return true;
    }

    return chatMember.user.id === message.sender.user.id;
  }

  isAdminOrGreater(chatMember:ChatMemberDto){
    if(!chatMember.role){
      return false;
    }

    if(chatMember.role?.order >= Roles.Admin){
      return true;
    }

    return false;
  }

  isMember(chatMember:ChatMemberDto){
    if(!chatMember.role)
    {
      return false;
    }

    return chatMember.role.name === Roles[Roles.Member];
  }
}
