import { HttpService } from './http.service';
import { Router } from '@angular/router';
import { NetworkService } from './network.service';
import { UserService } from 'src/app/services/user.service';
import { JwtFacadeService } from './jwt-facade.service';
import { AuthRepsonseDto } from '../../dtos/AuthResponseDto';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private jwt:JwtFacadeService, private userService:UserService,
    private router:Router, private network: NetworkService, private http:HttpService) { }

  public logIn(authDto : AuthRepsonseDto){
    if(authDto.isAuthSuccessfull === false){
      return;
    }

    this.jwt.setTokens(authDto.accessToken!,authDto.refreshToken!);
    const decodedToken = this.jwt.decodeToken(authDto.accessToken!);
    this.userService.setCurrentUserFromToken(decodedToken);
    this.router.navigate(['']);
    this.http.getUserChats(this.userService.currentUser.id)
      .subscribe(result => {
        this.userService.chats = result;
        if(this.userService.chats){
          this.userService.selectedChat = this.userService.chats[0];
          this.userService.setSelectedChatValues();
        }
       
        this.network.configureHub();
      });
  }

  logOut(){
    this.jwt.removeTokens();
    this.network.disconnect();
  }
}
