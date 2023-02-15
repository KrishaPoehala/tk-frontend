import { Injectable, EventEmitter } from '@angular/core';
import { ChatDto } from '../dtos/ChatDto';

@Injectable({
  providedIn: 'root'
})
export class ChatCreatedService {

  constructor() { }

  public chatCreatedEmmiter:EventEmitter<ChatDto> = new EventEmitter();
}
