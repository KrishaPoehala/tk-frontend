import { ChatDto } from 'src/app/dtos/ChatDto';
import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SelectedChatChangedService {

  constructor() {
  
   }
  public set: {[id:number]: EventEmitter<ChatDto>} = {};

  public init(chats:ChatDto[]){
    chats.forEach(e => {
      this.set[e.id] = new EventEmitter();
    });
  }

  public add(chatId:number){
    this.set[chatId] = new EventEmitter(); 
  }
}
