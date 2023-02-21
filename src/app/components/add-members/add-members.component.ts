import { NetworkService } from './../../services/network.service';
import { PresenceService } from 'src/app/services/presence.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from 'src/app/services/http.service';
import { AddMembersDto } from '../../dtos/AddMembersDto';
import { UserDto } from 'src/app/dtos/UserDto';
import { UserService } from 'src/app/services/user.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-members',
  templateUrl: './add-members.component.html',
  styleUrls: ['./add-members.component.css']
})
export class AddMembersComponent implements OnInit {

  constructor(private userService:UserService, private http:HttpService,
    private modal:NgbActiveModal, private network:NetworkService) { }
  contacts!:UserDto[];
  public membersToAdd!:UserDto[];
  groupMembers!:UserDto[];
  selectedMembers!:{ [id:string]:boolean};
  ngOnInit(): void {
    this.selectedMembers = {};
    this.contacts = this.userService.getContacts();
    this.groupMembers = this.userService.selectedChat!.members.map(x => x.user);
    for(let member of this.groupMembers){
      this.selectedMembers[member.id] = true;
    }    

    this.membersToAdd = [];
  }

  onAddMemberClicked(newMember:UserDto){
    if(this.groupMembers.find(x => x.id === newMember.id)){
      return;
    }
    
    if(this.selectedMembers[newMember.id]){
      const deleteIndex = this.membersToAdd.findIndex(x => x.id === newMember.id);
      this.membersToAdd.splice(deleteIndex, 1);
      this.selectedMembers[newMember.id] = false;
      return;
    }
    
    this.membersToAdd.push(newMember);
    this.selectedMembers[newMember.id] = true;
  }

  onAddClick(){
    if(this.membersToAdd.length === 0){
      return;
    }

    const dto = new AddMembersDto(this.userService.selectedChat!.id, this.membersToAdd.map(x => x.id));
    this.http.addMembers(dto).subscribe(async _ =>{
      this.modal.close();
      dto.newMemberIds.forEach(async x => {
        await this.network.connectNewUserTo(x, this.userService.selectedChat!.id);
      });
    });
  }
}
