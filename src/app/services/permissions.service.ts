import { PermissionDto } from './../dtos/PermissionDto';
import { Permissions } from './../enums/permissions';
import { Roles } from './../enums/roles';
import { UserService } from 'src/app/services/user.service';
import { ChatMemberDto } from '../dtos/ChatMemberDto';
import { MessageDto } from 'src/app/dtos/MessageDto';
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
    
    if(chatMember.role!.order > message.sender.role!.order){
      return true;
    }

    return chatMember.user.id === message.sender.user.id;
  }

  hasPermissionsForSending(permissions:PermissionDto[] | undefined){
    if(!permissions || permissions?.length === 0){
      return true;
    }

    return permissions.some(x => x.name === Permissions[Permissions.SendMessages]);
  }

  hasPermisisonsForRemovingUsers(memberToRemove:ChatMemberDto){
    if(!memberToRemove.role){
      return true;
    }

    if(memberToRemove.permissions.length === 0){
      return true;
    }

    return this.userService.currentUserAsMember.permissions.some(x => x.name === Permissions[Permissions.RemoveUsers])
    && this.userService.currentUserAsMember.role!.order > memberToRemove.role!.order;
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

  canPromoteToAdmin(member:ChatMemberDto){
    if(member.role?.name === Roles[Roles.Owner]){
      return true;
    }

    if(member.role?.name === Roles[Roles.Admin]){
      return member.permissions.some(x => x.name === Permissions[Permissions.AddNewAdmins]);
    }

    return false;
  }

  hasPermissionsForAddingUsers(member:ChatMemberDto){
    if(!member.role){
      return;
    }

    return member.permissions.some(x => x.name === Permissions[Permissions.AddUsers]);
  }
}
