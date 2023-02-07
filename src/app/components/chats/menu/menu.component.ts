import { JoinGroupModalComponent } from './../../join-group-modal/join-group-modal.component';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateGroupComponent } from 'src/app/components/create-group/create-group.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(private auth:AuthService, private router:Router,
    private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  logOutHandler(){
    this.auth.logOut();
    this.router.navigate(['../login']);
  }

  newGroupHandler(){
    this.modalService.open(CreateGroupComponent);
  }

  joinPublicGroupHandler(){
    this.modalService.open(JoinGroupModalComponent);
  }
}
