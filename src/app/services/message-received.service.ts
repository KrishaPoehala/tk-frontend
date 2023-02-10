import { UserService } from 'src/app/services/user.service';
import { Injectable, EventEmitter } from '@angular/core';
import { MessageDto } from '../dtos/MessageDto';

@Injectable({
  providedIn: 'root'
})
export class MessageReceivedService {

  constructor(private userService: UserService) {
    
   }

   public init(){
    this.userService.chats.value.forEach(e => {
    });
   }

   
}
