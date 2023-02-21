import { UserDto } from 'src/app/dtos/UserDto';


export class AddMembersDto{
    constructor(public chatId:string,public newMemberIds:string[])
    {}
}