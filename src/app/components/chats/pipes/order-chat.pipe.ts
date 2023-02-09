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
      const id = this.userService.currentUser.id;
      const leftUserChatOrder = left.members
        .find(x => x.user.id === id)?.chatOrder;
      const rigthUserChatOrder = rigth.members
        .find(x => x.user.id ===id)?.chatOrder;

        return rigthUserChatOrder! - leftUserChatOrder!;
    })
  }

}
