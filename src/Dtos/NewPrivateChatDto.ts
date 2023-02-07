import { UserDto } from 'src/dtos/UserDto';
export class NewPrivateChatDto{
    public name:string;
    public leftUserId!:number;
    public rightUserId!:number;
    constructor(
        leftUser: UserDto,
        rightUser: UserDto,
    )
    {
        this.leftUserId = leftUser.id;
        this.rightUserId = rightUser.id;
        this.name = getGroupName(leftUser.id, rightUser.id);
    }
}

function getGroupName(left: number, rigth: number): string {
    if(left < rigth){
        return 'group/' + left.toString() + '---' + rigth.toString();
    }

    return 'group/' + rigth.toString() + '---' + left.toString();
}
