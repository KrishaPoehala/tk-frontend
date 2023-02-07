import { JwtHelperService } from '@auth0/angular-jwt';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JwtFacadeService {
  constructor(private jwt: JwtHelperService) { }

  getAccessToken(){
    return localStorage.getItem("accessToken");
  }

  getRefreshToken(){
    return localStorage.getItem("refreshToken");
  }

  setTokens(accessToken:string, refreshToken:string){
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  isTokenExpired(token:string | null){
    return this.jwt.isTokenExpired(token);
  }

  decodeToken(token: string){
    return this.jwt.decodeToken(token);
  }

  removeTokens(){
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
}
