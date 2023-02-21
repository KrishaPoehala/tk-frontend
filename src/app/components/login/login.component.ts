import { GoogleAuthDto } from './../../dtos/GoogleAuthDto';
import { AuthService } from '../../services/auth.service';
import { NetworkService } from '../../services/network.service';
import { UserService } from 'src/app/services/user.service';
import { JwtFacadeService } from '../../services/jwt-facade.service';
import { Router } from '@angular/router';
import { AuthRepsonseDto } from '../../dtos/AuthResponseDto';
import { LoginModel } from '../../dtos/LoginModel';
import { HttpService } from 'src/app/services/http.service';
import { FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SocialAuthService, GoogleLoginProvider, SocialUser } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private fb:FormBuilder, private http:HttpService, 
    private authService:AuthService,private googleAuth:SocialAuthService) { }
  loginForm = this.fb.group({
    email:[''],
    password:[''],
  })

  ngOnInit(): void {
    //this.jwt.removeTokens();
  }

  login(){
    if(this.loginForm.invalid){
      return;
    }

    const email = this.loginForm.controls.email.value;
    const password = this.loginForm.controls.password.value;
    const loginModel = new LoginModel(email!,password!);
    this.http.login(loginModel).subscribe((r) => {
      if(r.isAuthSuccessfull){
        this.authService.logIn(r);
        return;
      }
    },
    (errorResult) => {
      const error = errorResult.error.errors![0].split(':') as string[];
      this.loginForm.get(error[0].toLowerCase())?.setErrors({'error':error[1]});
    });
  }

  loginWithGoogle(){
    this.googleAuth.signIn(GoogleLoginProvider.PROVIDER_ID)
    .then(user => {
      console.log(user);
      this.handleGoogleAuth(user);
    });
  }

  private handleGoogleAuth(user: SocialUser) {
    const googleAuth: GoogleAuthDto = {
      provider: user.provider,
      token: user.idToken,
    };
    this.http.authWithGoogle(googleAuth).subscribe({
      next: (r) => {
        this.authService.logIn(r);
      }
    });
  }
}