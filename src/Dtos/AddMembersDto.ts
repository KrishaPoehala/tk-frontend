import { UserDto } from 'src/dtos/UserDto';


export class AddMembersDto{
    constructor(public chatId:number,public newMemberIds:number[])
    {}
}