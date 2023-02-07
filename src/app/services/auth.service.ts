import { HttpService } from './http.service';
import { Router } from '@angular/router';
import { NetworkService } from './network.service';
import { UserService } from 'src/app/services/user.service';
import { JwtFacadeService } from './jwt-facade.service';
import { AuthRepsonseDto } from '../dtos/AuthResponseDto';
import { Injectable } from '@angular/core';
import { UserDto } from 'src/app/dtos/UserDto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private jwt:JwtFacadeService, private userService:UserService,
    private router:Router, private network: NetworkService, private http:HttpService) { }

  public logIn(authDto : AuthRepsonseDto){
    console.log(authDto);
    if(authDto.isAuthSuccessfull === false){
      return;
    }

    this.jwt.setTokens(authDto.accessToken!,authDto.refreshToken!);
    const decodedToken = this.jwt.decodeToken(authDto.accessToken!);
    const userId = Number(decodedToken['id']);
    this.userService.currentUser = new UserDto(userId, "","","");
    this.http.getUserById(userId).subscribe(user => {
        this.userService.currentUser = user;
    });
    this.router.navigate(['']);
    this.http.getUserChats(userId)
      .subscribe(result => {
        this.userService.chats = result;
        if(this.userService.chats){
          this.userService.setfirstChatAsSelected(0);
        }
       
        this.network.configureHub();
      });
  }

  logOut(){
    this.jwt.removeTokens();
    this.network.disconnect();
  }
}
