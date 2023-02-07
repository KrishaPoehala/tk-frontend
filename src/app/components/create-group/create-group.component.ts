import { ChatMemberDto } from './../../../dtos/ChatMemberDto';
import { ChatDto } from './../../../dtos/ChatDto';
import { NewGroupDto } from './../../../dtos/NewGroupDto';
import { GyazoResponseDto } from '../../../dtos/GyazoResponseDto';
import { GyazoService } from '../../services/gyazo.service';
import { NewPrivateChatDto } from '../../../dtos/NewPrivateChatDto';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../services/http.service';
import { read } from '@popperjs/core';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { UserDto } from 'src/dtos/UserDto';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css']
})
export class CreateGroupComponent implements OnInit {

  constructor(private fb:FormBuilder, private userService:UserService,
    private http:HttpService,private modal :NgbActiveModal,
    private gyazoService:GyazoService) { }
  contacts!:UserDto[];
  ngOnInit(): void {
    this.contacts = this.userService.getContacts();
    this.members = [];
    this.selectedMembers = {};
  }

  members!:UserDto[];
  selectedMembers!:{ [id:number]:boolean};
  onClick(memberToAdd:UserDto){
    if(this.selectedMembers[memberToAdd.id]){
      const indexToDelete = this.members.findIndex(x => x.id === memberToAdd.id);
      this.members.splice(indexToDelete, 1);
      this.selectedMembers[memberToAdd.id] = false;
      return;
    }

    this.members.push(memberToAdd);
    this.selectedMembers[memberToAdd.id] = true;
  }

  isCreateGroupFormShown = false;
  onContinueClick(){
    this.isCreateGroupFormShown = true;
  }

  isImageChoosen = false;
  imagePath!:string;
  imageFile!:File;
  onGroupPhotoChange(event:any){
    this.imageFile = event.target.files[0];
    this.isImageChoosen = true;
    const reader = new FileReader();
    reader.onload = _ => this.imagePath = reader.result as string;
    reader.readAsDataURL(this.imageFile);
  }

  createGroupForm = this.fb.group({
    name:[''],
    isPublic:[false],
  })

  gyazoImageUrl!:string;
  onCreateGroup(){
    const newGroupDto =this._getNewGroupDto(this.imagePath);
    const groupDto = this._toGroupDto(newGroupDto);
    this.userService.chats.unshift(groupDto);
    this.userService.setfirstChatAsSelected(0);
    this.modal.close();
    this.gyazoService.uploadImage(this.imageFile)
    .then(async x => await x.json())
    .then(x => {
      this.gyazoImageUrl = x.url;
      const newGroupWithGyazoUrl = this._getNewGroupDto(this.gyazoImageUrl);
      this.http.createGroup(newGroupWithGyazoUrl).subscribe();
    });
  }

  private _getNewGroupDto(imageUrl:string){
    const controls = this.createGroupForm.controls;
    const name = controls.name.value || "";
    const isPublic = controls.isPublic.value || false;
    return new NewGroupDto(name,this.members.map(x => x.id),this.userService.currentUser.id,
    true,isPublic,imageUrl);
  }

  private _toGroupDto(newGroup: NewGroupDto){
    const chatMembers = this.members.map(x => new ChatMemberDto(-1,x,null,[],-1));
    return new ChatDto(-1,newGroup.name, [],chatMembers,newGroup.imageUrl,newGroup.isGroup);
  }

  getMembersExceptCurrentUser(){
    return this.members.filter(x => x.id !== this.userService.currentUser.id);
  }

}
