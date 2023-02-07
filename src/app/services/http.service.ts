import { PermissionDto } from './../../dtos/PermissionDto';
import { ChatMemberDto } from './../../dtos/ChatMemberDto';
import { AddMembersDto } from './../../dtos/AddMembersDto';
import { NewGroupDto } from '../../dtos/NewGroupDto';
import { RegisterUserDto } from '../../dtos/RegisterUserDto';
import { RefreshTokenDto } from '../../dtos/RefreshTokenDto';
import { LoginModel } from '../../dtos/LoginModel';
import { NewPrivateChatDto } from '../../dtos/NewPrivateChatDto';
import { AuthRepsonseDto } from '../../dtos/AuthResponseDto';

import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { ChatDto } from "src/dtos/ChatDto";
import { environment } from "src/environments/environment";
import { NewMessageDto } from "src/dtos/NewMessageDto";
import { first } from "rxjs";
import { RefeshedTokenResponseDto } from 'src/dtos/RefeshedTokenResponseDto';
import { GyazoResponseDto } from 'src/dtos/GyazoResponseDto';
import { MessageDto } from 'src/dtos/MessageDto';
import { UserDto } from 'src/dtos/UserDto';

@Injectable()
export class HttpService{

    constructor(private http: HttpClient){}
    public getUserChats(id:number){
        return this.http.get<ChatDto[]>(environment.userChats + id);
    }

    public getRandomUser(){
        return this.http.get<UserDto>(environment.randomUser);
    }

    public getChatMessages(chatId : number, userId : number,
         pageNumber: number, messagesToLoad: number){
        return this.http.get<MessageDto[]>(environment.firstMessages + `${chatId}/${userId}
        /${pageNumber}/${messagesToLoad}`);
    }

    public sendMessage(dto : NewMessageDto){
        return this.http.post(environment.sendMessage,dto);
    }

    public editMessage(messageId: number, newText: string){
        const param = {
            messageId : messageId,
            editedText: newText,
        }

        return this.http.put(environment.editMessage, param);
    }

    public deleteMessage(id : number, isDeleteOnlyForSender = false){
        return this.http.delete(environment.delete + id +'/'+ isDeleteOnlyForSender);
    }

    public login(loginModel: LoginModel){
        return this.http.post<AuthRepsonseDto>(environment.login, loginModel);
    }

    public refresh(dto: RefreshTokenDto){
        return this.http.post<RefeshedTokenResponseDto>(environment.refresh, dto);
    }

    public uploadImage(url:string, data:FormData){
        return this.http.post<GyazoResponseDto>(url, data);
    }

    public register(dto:RegisterUserDto){
        return this.http.post<AuthRepsonseDto>(environment.register,dto);
    }

    public createGroup(dto:NewGroupDto){
        return this.http.post<ChatDto>(environment.api + "Chats/createPublic", dto);
    }

    public createPrivateChat(dto:NewPrivateChatDto){
        return this.http.post<ChatDto>(environment.api + "Chats/createPrivate",dto);
    }

    public addMembers(dto: AddMembersDto){
        return this.http.put(environment.addMembers, dto);
    }

    public getPublicGroups(userId:number){
        return this.http.get<ChatDto[]>(environment.api + `Chats/publicGroups/${userId}`);
    }

    public joinUser(userId:number, groups:ChatDto[]){
        const dto = {
            userId:userId,
            groupsIds:groups.map(x => x.id),
        }

        return this.http.put(environment.api + "Members/joinUser",dto);
    }

    public promoteToAdmin(member:ChatMemberDto){
        const model = {
            memberToPromoteId:member.id,
            chatId:member.chatId,
        }

        return this.http.put(environment.api + "Permissions/promoteToAdmin",model);
    }

    public updatePermissions(member:ChatMemberDto,newPermissions:PermissionDto[]){
        const model = {
            memberToUpdateId:member.id,
            newPermissions:newPermissions,
            chatId:member,
        }

        return this.http.put(environment.api + "Permissions/update", model);
    }
}