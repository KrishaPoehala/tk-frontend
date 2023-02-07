import { AuthService } from '../../services/auth.service';
import { NetworkService } from '../../services/network.service';
import { UserService } from 'src/app/services/user.service';
import { JwtFacadeService } from '../../services/jwt-facade.service';
import { Router } from '@angular/router';
import { AuthRepsonseDto } from '../../../dtos/AuthResponseDto';
import { LoginModel } from '../../../dtos/LoginModel';
import { HttpService } from 'src/app/services/http.service';
import { FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private fb:FormBuilder, private http:HttpService, 
    private authService:AuthService) { }
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
    this.http.login(loginModel).subscribe(r => {
      this.authService.logIn(r);
    });
  }
}