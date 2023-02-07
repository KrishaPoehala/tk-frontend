import { UserDto } from 'src/app/dtos/UserDto';


export class AddMembersDto{
    constructor(public chatId:number,public newMemberIds:number[])
    {}
}