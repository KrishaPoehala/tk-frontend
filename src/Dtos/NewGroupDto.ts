import { UserDto } from "./UserDto";

export class NewGroupDto{
    constructor(public name:string,public memberIds:number[],public ownerId:number,
        public isGroup:boolean,public isPublic:boolean, public imageUrl:string){
    }
}