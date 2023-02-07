import { MessageService } from './message-sender.service';
import { MessageDto } from '../dtos/MessageDto';
import { Observable, of } from 'rxjs';
import { ChatDto } from 'src/app/dtos/ChatDto';
import { HttpService } from './http.service';
import { UserService } from 'src/app/services/user.service';
import { Injectable } from '@angular/core';
import { NewPrivateChatDto } from 'src/app/dtos/NewPrivateChatDto';
import { UserDto } from 'src/app/dtos/UserDto';

@Injectable({
  providedIn: 'root'
})
export class RedirectionService {

  constructor(private userService:UserService, private http:HttpService,
    private sender:MessageService) { }

  redirectToUser(sender:UserDto){
    if(this.userService.currentUser.id === sender.id){
      return;
    }

    if(this.userService.setSelectedPrivateChat(sender) === false){
        const dto = new NewPrivateChatDto(sender, this.userService.currentUser);
        this.http.createPrivateChat(dto).subscribe(result => {
          this.userService.setSelectedChat(result);
        });

      }

      this.userService.setSelectedChatValues();
  }

  redirectMessage(messageToForward:MessageDto){
    if(this.userService.doesPrivateChatExist(messageToForward.sender.user)){
      const chatId = this.userService.getPrivateChatId(messageToForward.sender.user);
      this.sender.forwardMessage(messageToForward,chatId!).subscribe();
      return;
    }
  
    this.http.createPrivateChat(new NewPrivateChatDto(this.userService.currentUser,
      messageToForward.sender.user))
      .subscribe(result =>{
        this.userService.chats.push(result);
        this.sender.forwardMessage(messageToForward, result.id).subscribe();
      });
  }
}
