import { MessageSentDto } from './../dtos/MessageSentDto';
import { ChatDto } from 'src/app/dtos/ChatDto';
import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SelectedChatChangedService {

  constructor() {
  
   }

   public chatSelectionChangedEmitter:EventEmitter<MessageSentDto> = new EventEmitter();
}
