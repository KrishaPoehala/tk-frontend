import { ChatMemberDto } from './ChatMemberDto';
import { UserDto } from './UserDto';


export interface UserJoinedDto{
    joinedMember:ChatMemberDto,
    groupId:string,
}