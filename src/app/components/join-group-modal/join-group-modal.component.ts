import { NetworkService } from './../../services/network.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from 'src/app/services/http.service';
import { UserService } from 'src/app/services/user.service';
import { ChatDto } from 'src/app/dtos/ChatDto';
import { ChatDetailsComponent } from './../chats/chat-details/chat-details.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-join-group-modal',
  templateUrl: './join-group-modal.component.html',
  styleUrls: ['./join-group-modal.component.css']
})
export class JoinGroupModalComponent implements OnInit {

  constructor(public userService:UserService, private http:HttpService,
    private modal:NgbActiveModal,private network:NetworkService) { }
  publicGroups!: ChatDto[];
  ngOnInit(): void {
    this.http.getPublicGroups(this.userService.currentUser.id).subscribe(result => this.publicGroups = result);
    this.selectedGroups = {};
    this.groups = [];
  }

  selectedGroups!: { [id:number]:boolean};
  groups!:ChatDto[];
  onAddGroupClick(group:ChatDto){
    this.groups.push(group);
    if(this.selectedGroups[group.id]){
      const deleteIndex = this.groups.findIndex(x => x.id === group.id);
      this.groups.splice(deleteIndex , 1);
      this.selectedGroups[group.id] = false;
      return;
    }

    this.selectedGroups[group.id] = true;
  }

  onJoin(){
    if(!this.userService.chats || this.userService.chats.value.length === 0){
      this.userService.chats.value = [...this.groups];
      this.userService.setfirstChatAsSelected(0);
    }
    else{
      this.userService.chats.value.push(...this.groups);
    }
    
    this.network.connectUserTo(this.groups);
    this.modal.close();
    this.http.joinUser(this.userService.currentUser.id, this.groups).subscribe(() => {
    });
  }
}
