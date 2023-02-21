import { UserDto } from "./UserDto";

export class NewGroupDto{
    constructor(public name:string,public memberIds:string[],public ownerId:string,
        public isGroup:boolean,public isPublic:boolean, public imageUrl:string){
    }
}