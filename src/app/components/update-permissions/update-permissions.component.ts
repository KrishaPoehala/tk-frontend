import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from 'src/app/services/http.service';
import { PermissionDto } from './../../../dtos/PermissionDto';
import { Permissions } from './../../enums/permissions';
import { ChatMemberDto } from './../../../dtos/ChatMemberDto';
import { Component, Input, OnInit } from '@angular/core';

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
  }

  getPermissionsInfo(){
    const all = Object.keys(Permissions).filter(x => isNaN(Number(x)))
    .map(x => new PermissionDto(x));
    const permissions = [];
    for(let i =0;i < all.length; ++i){
      const permission = this.member.permissions.find(x => x.name === all[i].name);
      permissions.push({
        decription:all[i].name,
        has:permission !== undefined,
        permission:all[i],
      })

      if(permission){
        this.set[permission.name] = true;
      }
    }

    return permissions;
  }

  selectedPermissions:PermissionDto[] = [];
  onChange(permission:PermissionDto){
    const index = this.selectedPermissions.findIndex(x => x.name === permission.name)
    if(index === -1){
      this.selectedPermissions.push(permission);
    }
    else{
      this.selectedPermissions.splice(index,1);
    }

  }

  changePermissions(){
    this.http.updatePermissions(this.member,this.selectedPermissions).subscribe(_ =>
      this.modal.dismissAll());
  }

  set!:{[id:string]:boolean}
}
