import { GoogleAuthDto } from './../dtos/GoogleAuthDto';
import { ChatDetailsComponent } from './../components/chats/chat-details/chat-details.component';
import { PermissionDto } from '../dtos/PermissionDto';
import { ChatMemberDto } from '../dtos/ChatMemberDto';
import { AddMembersDto } from '../dtos/AddMembersDto';
import { NewGroupDto } from '../dtos/NewGroupDto';
import { RegisterUserDto } from '../dtos/RegisterUserDto';
import { RefreshTokenDto } from '../dtos/RefreshTokenDto';
import { LoginModel } from '../dtos/LoginModel';
import { NewPrivateChatDto } from '../dtos/NewPrivateChatDto';
import { AuthRepsonseDto } from '../dtos/AuthResponseDto';

import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { ChatDto } from "src/app/dtos/ChatDto";
import { environment } from "src/environments/environment";
import { NewMessageDto } from "src/app/dtos/NewMessageDto";
import { first } from "rxjs";
import { RefeshedTokenResponseDto } from 'src/app/dtos/RefeshedTokenResponseDto';
import { GyazoResponseDto } from 'src/app/dtos/GyazoResponseDto';
import { MessageDto } from 'src/app/dtos/MessageDto';
import { UserDto } from 'src/app/dtos/UserDto';

@Injectable()
export class HttpService{


    constructor(private http: HttpClient){}
    public getUserChats(id:string){
        return this.http.get<ChatDto[]>(environment.api + '/Chats/chats/' + id);
    }

    public getUnreadMessages(chatId : string, userId : string, messagesToLoad: number,page:number){
            const params = new HttpParams()
            .set('messagesToLoad', messagesToLoad)
            .set('pageNumber', page);
        return this.http.get<MessageDto[]>(environment.api + '/Chats/messages/' + `${chatId}/${userId}`,
         {params:params});
    }

    public getPaginationMessage(messageId:string, messagesToLoad:number){
        const params = new HttpParams()
        .set('messagesToLoad', messagesToLoad);
        return this.http.get<MessageDto[]>(environment.api + `/Chats/paginationMessages/${messageId}`,
         {params:params});
    }

    public saveMessage(dto : NewMessageDto){
        return this.http.post(environment.api + '/Messages/send',dto);
    }
    
   
    public editMessage(messageId: string, newText: string){
        const param = {
            messageId : messageId,
            editedText: newText,
        }

        return this.http.put(environment.api + "/Messages/edit", param);
    }

    public deleteMessage(id : string, isDeleteOnlyForSender = false){
        return this.http.delete(environment.api + '/Messages/delete/' + id +'/'+ isDeleteOnlyForSender);
    }

  
    public login(loginModel: LoginModel){
        return this.http.post<AuthRepsonseDto>(environment.api + '/Accounts/login', loginModel);
    }

    public refresh(dto: RefreshTokenDto){
        return this.http.post<RefeshedTokenResponseDto>(environment.api + '/Tokens/refresh', dto);
    }

    public uploadImage(url:string, data:FormData){
        return this.http.post<GyazoResponseDto>(url, data);
    }
    
    public register(dto:RegisterUserDto){
        return this.http.post<AuthRepsonseDto>(environment.api + '/Accounts/register',dto);
    }
    
    public createGroup(dto:NewGroupDto){
        return this.http.post<ChatDto>(environment.api + "/Chats/createPublic", dto);
    }
    
    public createPrivateChat(dto:NewPrivateChatDto){
        return this.http.post<ChatDto>(environment.api + "/Chats/createPrivate",dto);
    }
    
    public addMembers(dto: AddMembersDto){
        return this.http.put(environment.api + '/Members/addMembers', dto);
    }

    public getPublicGroups(userId:string){
        return this.http.get<ChatDto[]>(environment.api + `/Chats/publicGroups/${userId}`);
    }

    public joinUser(userId:string, groups:ChatDto[]){
        const dto = {
            userId:userId,
            groupsIds:groups.map(x => x.id),
        }

        return this.http.put(environment.api + "/Members/joinUser",dto);
    }

    public promoteToAdmin(member:ChatMemberDto){
        const model = {
            memberToPromoteId:member.id,
            chatId:member.chatId,
        }

        return this.http.put(environment.api + "/Permissions/promoteToAdmin",model);
    }

    public updatePermissions(member:ChatMemberDto,newPermissions:PermissionDto[]){
        const model = {
            memberToUpdateId:member.id,
            newPermissions:newPermissions,
            chatId:member.chatId,
        }

        return this.http.put(environment.api + "/Permissions/update", model);
    }

    public removeUser(memberId:string){
        return this.http.delete(environment.api + `/Members/removeMember/${memberId}`);
    }

    public getUserById(userId:string){
        return this.http.get<UserDto>(environment.api + `/Users/user/${userId}`);
    }

    public saveReadMessages(memberId:string, messages:MessageDto[]){
        const model= {
            memberId:memberId,
            messageIds:messages.map(x => x.id),
        }

        return this.http.put(environment.api + '/Users/saveReadMessages', model);
    }

    public authWithGoogle(dto:GoogleAuthDto){
        return this.http.post<AuthRepsonseDto>(environment.api + '/Accounts/googleAuth',dto);
    }
}