import { ChatDto } from './ChatDto';


export class MessageSentDto{
    constructor(
        public chat:ChatDto,
        public scroll:boolean,
    )
    {}
}