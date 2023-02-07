import { AuthService } from '../../services/auth.service';
import { RegisterUserDto } from '../../../dtos/RegisterUserDto';
import { GyazoService } from '../../services/gyazo.service';
import { HttpService } from 'src/app/services/http.service';
import { AbstractControl, EmailValidator, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private fb:FormBuilder, private http:HttpService,
     private gyazoService: GyazoService, private authService: AuthService) { }

  registerForm = this.fb.group({
    firstName:['',Validators.required],
    email:['',Validators.email],
    password:['',[Validators.required,this.atLeastOneUpperCaseLetter(),
    this.asLeastOneDigit()]], 
    confirmPassword:['',this.equalsToPassword()],
  })

  private asLeastOneDigit():ValidatorFn{
    return (control:AbstractControl<string>):ValidationErrors | null => {
      const chars = [...control.value]
      if(chars.some(x => !isNaN(Number(x)))){
        return null;
      }

      return {'oneDigit':'Password has to have al least one digit'}
    }
  }
  private atLeastOneUpperCaseLetter():ValidatorFn{
    return (control:AbstractControl<string>):ValidationErrors| null => {
      const chars = [...control.value]
      console.log(chars,chars.some(x => x === x.toUpperCase()));
      if(chars.some(x => x === x.toUpperCase())){
        return null;
      }

      return {'upperCaseLetter':'The password has to have at least one uppercase letter'};
    };
  }

  private equalsToPassword():ValidatorFn{
    return (control:AbstractControl<string>):ValidationErrors| null => {
      const password = control.value;
      const confirmation = this.registerForm?.get('password')?.value;
      console.log('sfsfsdf');
      if(!confirmation){
        return {'missMatch':'The password and confirmation password does not match'};
      }

      if(password === confirmation){
        return null;
      }

      return {'missMatch':'The password and confirmation password does not match'};
    };
  }

  
  ngOnInit(): void {
  }

  async register(){
    let profilePhotoUrl = "";
    if(this.imageFile){
      const response = await this.gyazoService.uploadImage(this.imageFile);
      profilePhotoUrl = (await response.json()).url;
    }
    
    const registerDto = this.getRegisterDto(profilePhotoUrl);
    this.http.register(registerDto).subscribe(r => {
      this.authService.logIn(r);
    });
  }

  imageFile!:File;
  private getRegisterDto(profilePhotoUrl: string) {
    const controls = this.registerForm.controls;
    const firstName = controls.firstName.value;
    const email = controls.email.value;
    const password = controls.password.value;
    const confirmPassword = controls.confirmPassword.value;
    const registerDto = new RegisterUserDto(firstName, "", email, password,
      confirmPassword, profilePhotoUrl);
    return registerDto;
  }

  onFileSelected(event:any){
    this.imageFile = event.target.files[0];
  }

}
