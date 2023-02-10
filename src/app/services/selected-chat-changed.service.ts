import { ChatDto } from 'src/app/dtos/ChatDto';
import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SelectedChatChangedService {

  constructor() {
  
   }
  public static set: {[id:number]: EventEmitter<ChatDto>} = {};

  public static init(chats:ChatDto[]){
    chats.forEach(e => {
      this.set[e.id] = new EventEmitter();
    });
  }
}
