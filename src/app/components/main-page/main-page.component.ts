import { PresenceService } from './../../services/presence.service';
import { SelectedChatChangedService } from 'src/app/services/selected-chat-changed.service';
import { ChatsModule } from './../chats/chats.module';
import { HttpService } from 'src/app/services/http.service';
import { NetworkService } from '../../services/network.service';
import { UserService } from '../../services/user.service';
import { ChangeDetectorRef, Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Wrapper } from 'src/app/services/wraper.service';
@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit,OnDestroy {

  constructor(public readonly userService:UserService, private network: NetworkService,
    private http:HttpService,private selectedChatService:SelectedChatChangedService,
    private presence:PresenceService) 
  { }

  ngOnDestroy(): void {
  }


  ngOnInit(): void {
    if(!this.userService.currentUser){
      return;
    }

    this.http.getUserChats(this.userService.currentUser.id)
    .subscribe(result => {
      this.userService.chats = Wrapper.wrap(result);
      if(this.userService.chats && this.userService.chats.value.length > 0){
        //this.userService.setfirstChatAsSelected(0);
      }
      
      this.network.configureHub().then(_ => {

      });
    });
  }

  openChatDetails = false;
  openChatDetailsHandler(){
    this.openChatDetails = !this.openChatDetails;
  }
}