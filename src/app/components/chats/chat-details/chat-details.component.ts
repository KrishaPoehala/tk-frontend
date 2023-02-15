import { PermissionsService } from './../../../services/permissions.service';
import { ComponentPortal } from '@angular/cdk/portal';
import { PermissionsMenuComponent } from '../../permissions-menu/permissions-menu';
import { ChatMemberDto } from '../../../dtos/ChatMemberDto';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { AddMembersComponent } from './../../add-members/add-members.component';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/services/user.service';
import { Component, OnInit } from '@angular/core';
import { RedirectionService } from 'src/app/services/redirection.service';
import { UserDto } from 'src/app/dtos/UserDto';

@Component({
  selector: 'app-chat-details',
  templateUrl: './chat-details.component.html',
  styleUrls: ['./chat-details.component.css']
})
export class ChatDetailsComponent implements OnInit {

  constructor(public readonly userService: UserService, 
    private redirectionService:RedirectionService, private modal:NgbModal,
   readonly permissionsService:PermissionsService) { }

  ngOnInit(): void {
  }

  onMemberClicked(member:UserDto){
    this.redirectionService.redirectToUser(member);
  }

  onAddMembersClicked(){
    this.modal.open(AddMembersComponent);
  }

  isGroup(){
    const isGroup = this.userService.selectedChat?.value.isGroup;
    if(isGroup === null || isGroup === true){
      return true;
    }

    return false;
  }

  onRigthClick(eventInfo:any){
    const event = eventInfo.event;
    const selectedMember = eventInfo.selectedMember as ChatMemberDto;
    const currentUserAsMember = this.userService.selectedChat.value.members.find(x =>
      x.user.id === this.userService.currentUser.id);
    if(!currentUserAsMember){
      return;
    }

    if(!this.permissionsService.isAdminOrGreater(currentUserAsMember)){
      return;
    }

    if(selectedMember.id === currentUserAsMember.id){
      return;
    }

    event.preventDefault();
    const modalRef = this.modal.open(PermissionsMenuComponent);
    modalRef.componentInstance.selectedMember = selectedMember
  }

  getPresenceInfoFor(member:ChatMemberDto, usersOnline:number[]){
    if(!usersOnline){
      return 'last seen recently';
    }
    if(usersOnline.some(x => x === member.user.id)){
      return 'online'
    }

    return 'last seen recently'
  }
}
