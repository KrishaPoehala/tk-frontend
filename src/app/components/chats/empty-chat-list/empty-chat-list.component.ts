import { JoinGroupModalComponent } from './../../join-group-modal/join-group-modal.component';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-empty-chat-list',
  templateUrl: './empty-chat-list.component.html',
  styleUrls: ['./empty-chat-list.component.css']
})
export class EmptyChatListComponent implements OnInit {

  constructor(private modal:NgbModal) { }

  ngOnInit(): void {
  }

  onJoinClick()
  {
    this.modal.open(JoinGroupModalComponent)
  }
}
