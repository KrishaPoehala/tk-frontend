import { PresenceService } from 'src/app/services/presence.service';
import { ChatCreatedService } from './../../services/chat-created.service';
import { SelectedChatChangedService } from './../../services/selected-chat-changed.service';
import { ChatMemberDto } from '../../dtos/ChatMemberDto';
import { ChatDto } from '../../dtos/ChatDto';
import { NewGroupDto } from '../../dtos/NewGroupDto';
import { GyazoService } from '../../services/gyazo.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../services/http.service';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { UserDto } from 'src/app/dtos/UserDto';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css']
})
export class CreateGroupComponent implements OnInit {

  constructor(private fb:FormBuilder, private userService:UserService,
    private http:HttpService,private modal :NgbActiveModal,
    private gyazoService:GyazoService,private selectedChatService:SelectedChatChangedService,
    private chatCreated:ChatCreatedService,private presence:PresenceService) { }
  contacts!:UserDto[];
  ngOnInit(): void {
    this.contacts = this.userService.getContacts();
    this.members = [];
    this.selectedMembers = {};
    this.chatCreated.chatCreatedEmmiter.subscribe(newChat => {
      this.selectedChatService.add(newChat.id);
    });
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
    reader.onload = e => this.imagePath = e.target?.result as string;
    reader.readAsDataURL(this.imageFile); 
  } 

  createGroupForm = this.fb.group({
    name:[''],
    isPublic:[false],
  })

  gyazoImageUrl!:string;
  onCreateGroup(){
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

  getMembersExceptCurrentUser(){
    return this.members.filter(x => x.id !== this.userService.currentUser.id);
  }
}
