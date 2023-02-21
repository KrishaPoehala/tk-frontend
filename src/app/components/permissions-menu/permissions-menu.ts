import { UserService } from 'src/app/services/user.service';
import { UpdatePermissionsComponent } from './../update-permissions/update-permissions.component';
import { PermissionsService } from '../../services/permissions.service';
import { HttpService } from 'src/app/services/http.service';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChatMemberDto } from '../../dtos/ChatMemberDto';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-change-permissions',
  templateUrl: './permissions-menu.component.html',
  styleUrls: ['./permissions-menu.component.css']
})
export class PermissionsMenuComponent implements OnInit {

  constructor(private modal:NgbModal,private http:HttpService,
    readonly permissions:PermissionsService,
    readonly userService: UserService) { }
  @Input() selectedMember!:ChatMemberDto;
  ngOnInit(): void {
  }

  onPromoteToAdminClick(){
    this.http.promoteToAdmin(this.selectedMember)
    .subscribe(_ => this.modal.dismissAll());
  }

  onChangePermissionsClick(){
    this.modal.dismissAll();
    const modalRef = this.modal.open(UpdatePermissionsComponent,{
    });
    modalRef.componentInstance.member = this.selectedMember;
  }

  onRemoveUserClick(){
    const memberIndex = this.userService.selectedChat!.members.findIndex(X => X.id === this.selectedMember.id);
    this.userService.selectedChat!.members.splice(memberIndex,1);
    this.modal.dismissAll();
    this.http.removeUser(this.selectedMember.id).subscribe();
  }
}
