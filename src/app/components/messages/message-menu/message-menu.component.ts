import { MessageSeenListComponent } from './../../message-seen-list/message-seen-list.component';
import { ChatMemberDto } from '../../../dtos/ChatMemberDto';
import { PermissionDto } from '../../../dtos/PermissionDto';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageDto } from 'src/app/dtos/MessageDto';
import { PermissionsService } from './../../../services/permissions.service';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-message-menu',
  templateUrl: './message-menu.component.html',
  styleUrls: ['./message-menu.component.css']
})
export class MessageMenuComponent implements OnInit {

  @Input() message!:MessageDto;
  currentUserAsMember!:ChatMemberDto|undefined;
  constructor(private userService:UserService,
    readonly permissionsService: PermissionsService, private modal:NgbModal) { }

  ngOnInit(): void {
    this.currentUserAsMember = 
    this.userService.selectedChat!.members.find(x => x.user.id === this.userService.currentUser.id);
  }

  
  @Output() editMessageEmmiter:EventEmitter<MessageDto> = new EventEmitter();
  onEditClick(){
    this.editMessageEmmiter.emit(this.message);
  }

  @Output() replyMessageEmmiter: EventEmitter<MessageDto> = new EventEmitter();
  onReplyClick(){
    this.replyMessageEmmiter.emit(this.message);
  } 

  @Output() forwardMessageEmmiter:EventEmitter<MessageDto> = new EventEmitter();
  onForwardClick(){
    this.forwardMessageEmmiter.emit(this.message);
  }

  @Output() deleteMessageEmmiter:EventEmitter<MessageDto> = new EventEmitter();
  onDeleteClick(){
    this.deleteMessageEmmiter.emit(this.message);
  }

  onSeenClick(){
   const ref = this.modal.open(MessageSeenListComponent);
   ref.componentInstance.usersSeen = this.message.readBy?.map(x => x.user);
  }

  currentUsersMessage(){
    return this.message.sender.user.id === this.userService.currentUser.id;
  }
}
