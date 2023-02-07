import { ChatMemberDto } from '../dtos/ChatMemberDto';
import { Injectable } from "@angular/core";
import { ChatDto } from "src/app/dtos/ChatDto";
import { UserDto } from 'src/app/dtos/UserDto';

@Injectable()
export class UserService{
    public selectedChat! : ChatDto;
    public currentUser!:UserDto;
    public chats!: ChatDto[];
    setSelectedPrivateChat(sender: UserDto) {
        for(let i = 0; i < this.chats.length; ++i){
            if(this.isPrivateChat(this.chats[i], sender)){
                this.selectedChat = this.chats[i];
                return true;
            }
        }

        return false;
    }

    doesPrivateChatExist(rigthUser:UserDto){
        for(let i = 0; i < this.chats.length; ++i){
            if(this.isPrivateChat(this.chats[i], rigthUser)){
                return true;
            }
        }

        return false;
    }

    getPrivateChatId(user:UserDto){
        for(let i =0;i< this.chats.length;++i){
            if(this.isPrivateChat(this.chats[i],user)){
                return this.chats[i].id;
            }
        }

        return undefined;
    }

    private isPrivateChat(chat: ChatDto, sender: UserDto):boolean {
        if(chat.isGroup !== false){
            return false;
        }

        if(chat.members.find(x => x.user.id === sender.id)){
            return true;
        }

        return false;
    }
   
    setSelectedChat(chat : ChatDto){
        for (let i = 0; i < this.chats.length; i++) {
            const element = this.chats[i];
            if(element.id === chat.id){
                this.selectedChat = this.chats[i];
                this.setSelectedChatValues();
                this.setCurrentUserAsMember();
                return;
            }
        }
    }

    setfirstChatAsSelected(chatNumber:number){
        this.selectedChat = this.chats[chatNumber];
        console.log(this.selectedChat);
        this.setSelectedChatValues();
        this.setCurrentUserAsMember();
    }

    currentUserAsMember!:ChatMemberDto;
    setCurrentUserAsMember(){
        this.currentUserAsMember = this.selectedChat.members.find(x => x.user.id === this.currentUser.id)!;
        console.log(this.currentUserAsMember);
        console.log(this.selectedChat.members);
        console.log(this.selectedChat.members.some(x => x.user.id === this.currentUser.id));
        console.log(this.currentUser.id);
    }

    setSelectedChatValues() {
        const selectedChatValues = this._getSelectedChatInfo();
        this.selectedChatName = selectedChatValues[0];
        this.selectedChatPhotoUrl = selectedChatValues[1];
    }

    setCurrentUserFromToken(decodedToken:any){
        const id = decodedToken['id'];
        const name= decodedToken['name'];
        const email = decodedToken['email'];
        this.currentUser = new UserDto(Number.parseInt(id),name,email, '');
    }
    
    getContacts(){
        const privateChats = this.chats.filter(x => x.isGroup === false);
        const contacts = [];
        for(let i = 0; i <privateChats.length; ++i){
            const contact =   privateChats[i].members
            .filter(x => x.user.id !== this.currentUser.id)[0];
            contacts.push(contact);
        }

        return contacts.map(x => x.user);
    }

    selectedChatName!:string;
    selectedChatPhotoUrl!:string;
    private _getSelectedChatInfo(){
        const isGroup = this.selectedChat?.isGroup;
        if(isGroup || isGroup === null){
            return [this.selectedChat.name, this.selectedChat.imageUrl];
        }

        const theOtherUser =  this.selectedChat.members
        .filter(x => x.user.id !== this.currentUser.id)[0];
       return [theOtherUser.user.name, theOtherUser.user.profilePhotoUrl];
    }
}