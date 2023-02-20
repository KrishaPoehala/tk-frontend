import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RedirectionService } from './../../services/redirection.service';
import { Component, Input, OnInit } from '@angular/core';
import { UserDto } from 'src/app/dtos/UserDto';

@Component({
  selector: 'app-message-seen-list',
  templateUrl: './message-seen-list.component.html',
  styleUrls: ['./message-seen-list.component.css']
})
export class MessageSeenListComponent implements OnInit {

  constructor(private redirection:RedirectionService, private modal:NgbActiveModal) { }
  @Input() usersSeen!:UserDto[];

  ngOnInit(): void {
    console.log(this.usersSeen);
  }

  onClick(user:UserDto){
    this.redirection.redirectToUser(user);
    this.modal.dismiss();
  }

}
