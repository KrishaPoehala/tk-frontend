import { NetworkService } from './services/network.service';
import { UserService } from 'src/app/services/user.service';
import { JwtFacadeService } from './services/jwt-facade.service';
import { RefreshTokenDto } from './dtos/RefreshTokenDto';
import { HttpService } from 'src/app/services/http.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { UserDto } from 'src/app/dtos/UserDto';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router:Router, private http:HttpService,
    private jwtFacade:JwtFacadeService,
    private userService:UserService)
  {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
      const accessToken = this.jwtFacade.getAccessToken();
      const refreshToken = this.jwtFacade.getRefreshToken();
      const isNotExpired = !this.jwtFacade.isTokenExpired(accessToken);
      if(accessToken && isNotExpired){
        const userId = Number(this.jwtFacade.decodeToken(accessToken)['id']);
        this.userService.currentUser = new UserDto(userId, "","","");
        console.log(this.userService.currentUser.id);
        this.http.getUserById(userId).subscribe(user => {
          this.userService.currentUser = user;
        });
        return true;
      }

      let isRefreshingSuccessfull = false;
      const refreshDto = new RefreshTokenDto(accessToken!, refreshToken!);
      this.http.refresh(refreshDto).subscribe(result => {
        isRefreshingSuccessfull = result.isRefreshingSuccessfull;
        if(isRefreshingSuccessfull){
          this.jwtFacade.setTokens(result.accessToken!, result.refreshToken!);
          const userId = Number(this.jwtFacade.decodeToken(result.accessToken!)['id']);
         this.userService.currentUser = new UserDto(userId, "","","");
          this.http.getUserById(userId).subscribe(user => {
          this.userService.currentUser = user;
          });
        }
      });

      if(!isRefreshingSuccessfull){
        this.router.navigate(["login"]);
      }

      return isRefreshingSuccessfull;
  }
}
