import { AuthService } from '../../services/auth.service';
import { RegisterUserDto } from '../../../dtos/RegisterUserDto';
import { GyazoService } from '../../services/gyazo.service';
import { HttpService } from 'src/app/services/http.service';
import { EmailValidator, FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private fb:FormBuilder, private http:HttpService,
     private gyazoService: GyazoService, private authService: AuthService) { }

  registerForm = this.fb.group({
    firstName:[''],
    email:[''],
    password:[''],
    confirmPassword:[''],
  })

  
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
