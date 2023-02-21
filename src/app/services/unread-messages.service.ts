import { Injectable } from '@angular/core';
import { MessageDto } from '../dtos/MessageDto';

@Injectable({
  providedIn: 'root'
})
export class UnreadMessagesService {
  constructor() { }

  intersectionObjects:{[id:string]:IntersectionObserver} = {};

  messagesReadSet: {[chatId:string]:MessageDto[]} = {};
}
