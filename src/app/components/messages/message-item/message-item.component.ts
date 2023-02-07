import { UserService } from 'src/app/services/user.service';
import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from 'src/app/services/http.service';
import { RedirectionService } from 'src/app/services/redirection.service';
import { ChatDto } from 'src/app/dtos/ChatDto';
import { DeleteMessageModalComponent } from '../../delete-message-modal/delete-message-modal.component';
import { MessageDto } from 'src/app/dtos/MessageDto';
import { MessageStatus } from 'src/app/enums/message-status';
@Component({
  selector: 'app-message-item',
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.css'],
})
export class MessageItemComponent implements OnInit {

  constructor(
     private http: HttpService, private redirectionService:RedirectionService,
     public readonly userService: UserService, private modalService: NgbModal)
   { }

    MessageStatus = MessageStatus;
   
  ngOnInit() {
  }

  @Input() message!: MessageDto;

  deleteOnlyForCurrentUser = false;
  onDelete(){
    if(this.deleteOnlyForCurrentUser){
      this.deleteForSenderHandler();
    }

    this.http.deleteMessage(this.message.id || 0, this.deleteOnlyForCurrentUser)
    .subscribe();
  }

  deleteForSenderHandler( ){
    const length = this.userService.selectedChat?.messages?.length || 0;
    for(let i =0; i< length; ++i){
      if(this.userService.selectedChat?.messages[i].id === this.message.id){
        this.userService.selectedChat.messages.splice(i , 1);
        return;
      }
    }
  }

  isCurrentUsersMessage(){
    return this.message.sender.user.id === this.userService.currentUser.id;
  }

  privateChat: ChatDto | null = null;
  onMessageTextClicked(){
    this.redirectionService.redirectToUser(this.message.sender.user);
  }

  deleteMessageModal(){
    const modalRef = this.modalService.open(DeleteMessageModalComponent);
    modalRef.result.then(r => {
      this.deleteOnlyForCurrentUser = r;
      this.onDelete();
    })
  }

  public onMouseLeaveHandler(event:any){
    if(this.callDispose){
      this.closeOverlayEventEmmiter.emit();
    }
  }

  callDispose = false;
  @Output() overlayEventEmmiter: EventEmitter<any> = new EventEmitter();
  @Output() closeOverlayEventEmmiter:EventEmitter<any> = new EventEmitter();
  onRigthClick(event:any){
    event.preventDefault();
    this.callDispose = false;
    const emitObject = {
      event:event,
      message:this.message,
    }
    this.overlayEventEmmiter.emit(emitObject);
    setTimeout(() => this.callDispose = true, 100);
  }

  onRepliedMessageClick(){
    const itemToScrollTo = document.getElementById(`item-${this.message.replyMessage!.id}`);
    if(!itemToScrollTo){
      return;
    }
    
    itemToScrollTo.scrollIntoView({
      behavior:'smooth',
      block: 'center',
      inline: 'center',
    });
    
    setTimeout(() =>{
    const backClass = this.message.sender.user.id === this.message.replyMessage?.sender.user.id ?
    'my-replied' : 'replied';
    itemToScrollTo.classList.add(backClass);
    setTimeout(() => itemToScrollTo.classList.remove(backClass),1200);
    },400);
  }

  shouldSenderNameBeShown(){
    if(this.isCurrentUsersMessage()){
      return false;
    }
    const messages = this.userService.selectedChat.messages;
    const index = messages.findIndex(x => x.id === this.message.id);
    if(index === 0){
      return true;
    }

    if(messages[index - 1].sender.user.id === this.message.sender.id){
      return false;
    }

    return true;
  }
}
