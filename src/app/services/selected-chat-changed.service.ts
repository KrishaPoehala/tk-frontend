import { Injectable, EventEmitter } from '@angular/core';
import { ChatDto } from '../dtos/ChatDto';

@Injectable({
  providedIn: 'root'
})
export class SelectedChatChangedService {

  constructor() { }

  public static selectedChatChangedEmmiter:EventEmitter<ChatDto> = new EventEmitter();
}
