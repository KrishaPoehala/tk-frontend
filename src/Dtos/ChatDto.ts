import { ChatMemberDto } from './ChatMemberDto';
import { MessageDto } from "./MessageDto";

export class ChatDto{
    constructor(
    public id:number,
    public name:string,
    public messages: MessageDto[],
    public members: ChatMemberDto[],
    public imageUrl: string,
    public isGroup : boolean | null)
    {}
}