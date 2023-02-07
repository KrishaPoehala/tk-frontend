import { MessageStatus } from '../enums/message-status';
import { ChatMemberDto } from './ChatMemberDto';
import { UserDto } from "./UserDto";

export class MessageDto{
    public status!:MessageStatus;
    constructor(
    public id:number,
    public text:string,
    public sender: ChatMemberDto,
    public chatId: number,
    public  sentAt: Date,
    public isDeletedOnlyForSender: boolean | null,
    public replyMessage: MessageDto | null)
    {   
    }
}