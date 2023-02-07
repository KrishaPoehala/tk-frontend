import { UserService } from '../../../services/user.service';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-chat-info',
  templateUrl: './chat-info.component.html',
  styleUrls: ['./chat-info.component.css']
})
export class ChatInfoComponent implements OnInit {

  constructor(public readonly userService:UserService) { }

  ngOnInit(): void {
  }

  openGroupInfo:boolean = false;
  onClick(){
    this.openGroupInfo = !this.openGroupInfo;
    this.clickedEventEmmiter.emit(this.openGroupInfo);
  }

  @Output() clickedEventEmmiter:EventEmitter<boolean> = new EventEmitter(); 
}
