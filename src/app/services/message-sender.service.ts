import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from 'src/app/services/http.service';
import { UserService } from 'src/app/services/user.service';
import { ChatMemberDto } from '../dtos/ChatMemberDto';
import { Injectable } from '@angular/core';
import { NewMessageDto } from 'src/app/dtos/NewMessageDto';
import { MessageDto } from 'src/app/dtos/MessageDto';
import { MessageStatus } from '../enums/message-status';
import { DeleteMessageModalComponent } from '../components/delete-message-modal/delete-message-modal.component';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private userService:UserService,private http:HttpService,
    private modalService:NgbModal) { }



  public forwardMessage(messageToForward:MessageDto,chatId:string){
//    return this.http.sendMessage(newMessage);
    return of(1);
  }




  deleteMessage(messageToDelete:MessageDto){
    const options:any= {
      size:'dialog-centered'
    }
    const modalRef = this.modalService.open(DeleteMessageModalComponent,options);
      modalRef.result.then(r => {
      const deleteOnlyForCurrentUser = r;
      const length = this.userService.selectedChat!.messages?.length || 0;
      for(let i =0; i< length; ++i){
        if(this.userService.selectedChat!.messages[i].id === messageToDelete.id){
          this.userService.selectedChat!.messages.splice(i , 1);
          return;
        }
      }

      this.http.deleteMessage(messageToDelete.id, deleteOnlyForCurrentUser)
      .subscribe();
    });
  }
}
