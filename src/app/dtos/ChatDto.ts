import { MessagesListComponent } from './../components/messages/messages-list/messages-list.component';
import { ChatMemberDto } from './ChatMemberDto';
import { MessageDto } from "./MessageDto";

export class ChatDto{
    public usersOnlineIds:string[] = [];
    constructor(
    public id:string,
    public name:string,
    public messages: MessageDto[],
    public members: ChatMemberDto[],
    public imageUrl: string,
    public isGroup : boolean | null)
    {
        this.usersOnlineIds = [];
    }
}