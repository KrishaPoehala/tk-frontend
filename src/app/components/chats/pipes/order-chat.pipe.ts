import { ChatMemberDto } from './../../../dtos/ChatMemberDto';
import { UserService } from './../../../services/user.service';
import { ChatDto } from './../../../dtos/ChatDto';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderChat'
})
export class OrderChatPipe implements PipeTransform {

  constructor(private userService:UserService)
  {}
  transform(array: ChatDto[] | undefined, ...args: unknown[]): ChatDto[] | undefined {
    return array?.sort((left,rigth)=> {
      if(left.messages.length === 0 || rigth.messages.length === 0){
        return 0;
      }

      const lMessage =  left.messages[left.messages.length - 1].sentAt;
      const rMessage = rigth.messages[rigth.messages.length - 1].sentAt;
      return new Date(rMessage).getTime() - new Date(lMessage).getTime();
    })
  }
}
