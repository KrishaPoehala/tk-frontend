import { HttpService } from 'src/app/services/http.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Component, Input, OnInit, HostListener, OnDestroy, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ChatDto } from 'src/app/dtos/ChatDto';
import { UserService } from 'src/app/services/user.service';
import { NewMessageDto } from 'src/app/dtos/NewMessageDto';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit {

  constructor(public userService : UserService, private fb:FormBuilder,
    private http:HttpService) {
   }


  ngOnInit(): void {
  }

  onClick(){
    var diff = 1;

    this.chats.forEach(x => {
        const member = x.members[0];
        for (let i = 0; i < 2; i += 1) {
          const date = new Date();
          date.setSeconds(diff++);
          const newMessage = new NewMessageDto(`TEST TEXT ${i}`, member, x.id, date
          ,null);
          this.http.sendMessage(newMessage).subscribe();
        }
  
      });
  }

  @Input() chats!: ChatDto[];
  filteredChats : ChatDto[] = [];
  searchForm = this.fb.group({
    searchedChat : ["",Validators.required],
  })

  onSearch(){
    const value = this.searchForm.controls.searchedChat.value;
    if(!value){
      this.filteredChats = this.chats;
      return;
    }

    this.filteredChats = this.chats.filter(x => this.selectSearchesValue(x).includes(value));
  }

  selectSearchesValue(x : ChatDto) : string{
    if(x.isGroup){
      return x.name;
    }

    var otherMemberName = x.members.filter(x => x.user.id !== this.userService.currentUser.id)[0];
    return otherMemberName.user.name;
  }
}
