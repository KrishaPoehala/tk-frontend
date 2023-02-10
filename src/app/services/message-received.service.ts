import { UserService } from 'src/app/services/user.service';
import { Injectable, EventEmitter } from '@angular/core';
import { MessageDto } from '../dtos/MessageDto';

@Injectable({
  providedIn: 'root'
})
export class MessageReceivedService {

  constructor(private userService: UserService) {
    this.set = {};
    
   }

   public init(){
    console.log('IIINIIIIITT');
    this.userService.chats.value.forEach(e => {
      this.set[e.id] = new EventEmitter();
    });
   }

  public set:{[id:number]: EventEmitter<MessageDto>}
}
