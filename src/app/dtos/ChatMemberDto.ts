import { ChatDto } from './ChatDto';
import { PermissionDto } from './PermissionDto';
import { RoleDto } from './RoleDto';
import { UserDto } from './UserDto';

export class ChatMemberDto{
    public unreadMessagesLength:number =0;
    constructor(
        public id:string, 
        public user:UserDto,
        public role:RoleDto | null,
        public permissions:PermissionDto[], 
        public chatId:string,
        )
    {
    }
}