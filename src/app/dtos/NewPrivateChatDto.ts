import { UserDto } from 'src/app/dtos/UserDto';
export class NewPrivateChatDto{
    public name:string;
    public leftUserId!:string;
    public rightUserId!:string;
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

function getGroupName(left: string, rigth: string): string {
    if(left < rigth){
        return 'group/' + left.toString() + '---' + rigth.toString();
    }

    return 'group/' + rigth.toString() + '---' + left.toString();
}
