import { MessageStatus } from '../enums/message-status';
import { ChatMemberDto } from './ChatMemberDto';
import { UserDto } from "./UserDto";

export class MessageDto{
    public status!:MessageStatus;
    constructor(
    public id:string,
    public text:string,
    public order:string, 
    public sender: ChatMemberDto,
    public chatId: string,
    public  sentAt: Date,
    public isDeletedOnlyForSender: boolean | null,
    public replyMessage: MessageDto | null,
    public readBy:ChatMemberDto[] | null,
    public isSeen:boolean)
    {   
    }
}