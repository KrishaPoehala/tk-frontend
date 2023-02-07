import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from 'src/app/services/http.service';
import { UserService } from 'src/app/services/user.service';
import { ChatMemberDto } from './../../dtos/ChatMemberDto';
import { Injectable } from '@angular/core';
import { NewMessageDto } from 'src/dtos/NewMessageDto';
import { MessageDto } from 'src/dtos/MessageDto';
import { MessageStatus } from '../enums/message-status';
import { DeleteMessageModalComponent } from '../components/delete-message-modal/delete-message-modal.component';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private userService:UserService,private http:HttpService,
    private modalService:NgbModal) { }

  public sendMessage(text:string, sender:ChatMemberDto,messageToReply:MessageDto | null){
    console.log(sender);
    let newMessage = new NewMessageDto(text,sender,
    this.userService.selectedChat?.id, new Date(),messageToReply);
    const chatIndex = this.userService.chats.findIndex(x => x.id === newMessage.chatId);
    this.userService.chats[chatIndex].messages.push(this.toMessage(newMessage));
    return this.http.sendMessage(newMessage);
  }

  public forwardMessage(messageToForward:MessageDto,chatId:number){
    const newMessage = this.toNewMessage(messageToForward,chatId);
    return this.http.sendMessage(newMessage);
  }

  private toNewMessage(message:MessageDto,chatId:number){
    return new NewMessageDto(message.text,message.sender,chatId,
      message.sentAt,null);
  }
  private toMessage(newMessage:NewMessageDto){
    const message = new MessageDto(-1,newMessage.text,newMessage.sender,newMessage.chatId,newMessage.sentAt,null,
      newMessage.replyMessage);
    message.status = MessageStatus.InProgress;
    return message;
  }

  deleteMessage(messageToDelete:MessageDto){
    const options:any= {
      size:'dialog-centered'
    }
    const modalRef = this.modalService.open(DeleteMessageModalComponent,options);
      modalRef.result.then(r => {
      const deleteOnlyForCurrentUser = r;
      const length = this.userService.selectedChat?.messages?.length || 0;
      for(let i =0; i< length; ++i){
        if(this.userService.selectedChat?.messages[i].id === messageToDelete.id){
          this.userService.selectedChat.messages.splice(i , 1);
          return;
        }
      }

      this.http.deleteMessage(messageToDelete.id, deleteOnlyForCurrentUser)
      .subscribe();
    });
  }
}