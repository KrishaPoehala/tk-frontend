import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from 'src/app/services/http.service';
import { PermissionDto } from './../../../dtos/PermissionDto';
import { Permissions } from './../../enums/permissions';
import { ChatMemberDto } from './../../../dtos/ChatMemberDto';
import { Component, Input, OnInit } from '@angular/core';
import { Roles } from 'src/app/enums/roles';

@Component({
  selector: 'app-update-permissions',
  templateUrl: './update-permissions.component.html',
  styleUrls: ['./update-permissions.component.css']
})
export class UpdatePermissionsComponent implements OnInit {

  constructor(private http:HttpService,private modal:NgbModal) { }
  @Input() member!:ChatMemberDto;
  ngOnInit(): void {
    this.set = {};
    this.getPermissionsInfo();
  }

  set!:{[id:string]:boolean}
  getPermissionsInfo(){
    const all = this._getPermissionsForSelectedMember();
    all.forEach(e => {
      if(this.member.permissions.some(x => x.name === e)){
        this.set[e] = true;
      }
      else{
        this.set[e] = false;
      }
    });
  }

  _getPermissionsForSelectedMember(){
    const all =Object.keys(Permissions).filter(x => isNaN(Number(x))); 
    if(this.member.role?.name === Roles[Roles.Admin]){
      return all;
    }

    const except = [Permissions[Permissions.AddNewAdmins], Permissions[Permissions.RemoveUsers]];
    return all.filter(x => !except.some(y => y === x));
  }

  selectedPermissions:PermissionDto[] = [];
  onChange(permissionName:string){
    if(this.set[permissionName]){
      this.set[permissionName] = false;
      return;
    }

    this.set[permissionName] = true;
  }

  changePermissions(){
    this.selectedPermissions = Object.keys(this.set).filter(x => this.set[x])
    .map(x => new PermissionDto(x));
    this.modal.dismissAll();
    this.member.permissions = this.selectedPermissions;
    this.http.updatePermissions(this.member,this.selectedPermissions).subscribe();
  }

  getIterator(){
    return Array.from(Object.keys(this.set));
  }

}
