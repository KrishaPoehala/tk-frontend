import { ChatsModule } from './../chats/chats.module';
import { HttpService } from 'src/app/services/http.service';
import { NetworkService } from '../../services/network.service';
import { UserService } from '../../services/user.service';
import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {

  constructor(public readonly userService:UserService, private network: NetworkService,
    private http:HttpService) 
  { }

  ngOnInit(): void {
    if(!this.userService.currentUser){
      return;
    }

    this.http.getUserChats(this.userService.currentUser.id)
    .subscribe(result => {
      this.userService.chats = result;
      console.log(this.userService.chats);
      if(this.userService.chats && this.userService.chats.length > 0){
        this.userService.setfirstChatAsSelected(0);
      }
      
      this.network.configureHub();
    });
  }

  openChatDetails = false;
  openChatDetailsHandler(){
    this.openChatDetails = !this.openChatDetails;
  }
}