import { ChatMemberDto } from './ChatMemberDto';
import { MessageDto } from './MessageDto';
import { UserDto } from "./UserDto"



export class NewMessageDto{
    constructor(
        public text:string,
        public sender: ChatMemberDto,
        public chatId: number,
        public sentAt: Date,
        public replyMessage:MessageDto | null,
    ){}
}