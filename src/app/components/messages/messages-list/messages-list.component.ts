import { Permissions } from './../../../enums/permissions';
import { PermissionsService } from './../../../services/permissions.service';
import { ChatMemberDto } from '../../../dtos/ChatMemberDto';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RedirectionService } from 'src/app/services/redirection.service';
import { ComponentPortal } from '@angular/cdk/portal';
import { MessageMenuComponent } from './../message-menu/message-menu.component';
import { Overlay } from '@angular/cdk/overlay';
import { OverlayRef } from '@angular/cdk/overlay';
import { MessageService } from './../../../services/message-sender.service';
import { UserService } from 'src/app/services/user.service';
import { HttpService } from 'src/app/services/http.service';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageDto } from 'src/app/dtos/MessageDto';
import { MessageStatus } from 'src/app/enums/message-status';

@Component({
  selector: 'app-messages-list',
  templateUrl: './messages-list.component.html',
  styleUrls: ['./messages-list.component.css'], 
  changeDetection: ChangeDetectionStrategy.Default
})
export class MessagesListComponent implements OnInit, AfterViewInit {

  constructor(private fb:FormBuilder, private http: HttpService,
    public readonly userService: UserService,private messageService:MessageService,
    private overlay:Overlay,private redirectionService:RedirectionService,
    readonly permissionsService:PermissionsService) { }
  
  ngOnInit(): void {
    if(this.permissionsService.hasPermissionsForSending(this.userService.currentUserAsMember)){
      this.messageForm.get('message')?.enable()
    }
    else{
      this.messageForm.get('message')?.disable();
    }
  }
   
  messageForm = this.fb.group({
    message: ['',Validators.required],
  });

  messageToReply:MessageDto | null = null;
  send(){
    if(!this.userService.selectedChat){
      return;
    }
    if(this.messageForm.invalid || this.userService.selectedChat?.id === -1){
      return;
    }

    const text = this.messageForm.controls.message.value?.trim() || "";
    if(!text){
      return;
    }

    if(this.messageToEdit){
      const messageIndex = this.userService.selectedChat.messages
                        .findIndex(x => x.id === this.messageToEdit?.id);
      this.userService.selectedChat.messages[messageIndex].text = text;
      this.http.editMessage(this.messageToEdit.id, text)
      .subscribe();
      this.messageToEdit = null;
      this.messageForm.controls.message.setValue('');
      return;
    }
    
    if(!this.userService.currentUserAsMember){
      this.userService.setCurrentUserAsMember();
    }

    this.messageService.sendMessage(text, this.userService.currentUserAsMember,this.messageToReply)
      .subscribe(_ => this.scrollToBottom());
    this.messageForm.controls.message.setValue('');
    this.messageToReply = null;
  }

  messagesToLoad=20;
  callsCount = 0;
  isWorking = false;
  currentPage = 1;
  sendMessage = Permissions[Permissions.SendMessages];
  onScroll(){
    if(this.userService.selectedChat.id === -1){
      return;
    }
    
    ++this.callsCount;
    if(!this.userService.selectedChat || this.callsCount === 1){
      return;
    }

    const top = this.scrollFrame.nativeElement.scrollTop;
    if(top !== 0 || this.isWorking){
      return;
    }
    this.isWorking = true;
    this.scrollFrame.nativeElement.scrollTop = 100;
    this.http.getChatMessages(this.userService.selectedChat.id, this.userService.currentUser.id, 
      this.currentPage, this.messagesToLoad)
    .subscribe(r =>{
        if(r.length === 0){
          return;
        }
        
        ++this.currentPage
          r.forEach(element => {
            element.status = MessageStatus.Delivered;
            this.userService.selectedChat?.messages.unshift(element);
          })
        });
    setTimeout(() => this.isWorking = false, 600);//forbid to call this method too many times
  }

  private scrollContainer: any;
  count = 0;
  ngAfterViewInit(): void {
    this.scrollContainer = this.scrollFrame.nativeElement;  
    this.itemElements.changes.subscribe(_ => {
      if(this.count > 0){
        return;
      }

      ++this.count;
      this.onItemElementsChanged();

    }); 
  }

  private onItemElementsChanged(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    this.scrollContainer.scroll({
      top: this.scrollContainer.scrollHeight,
      left: 0,
      behavior: 'auto'
    });
  }

  closeOverlayHandler(){
    this.overlayRef?.dispose();
  }
  messageToEdit:MessageDto | null = null;
  overlayRef:OverlayRef | null =null;
  openOverlayHandler(emitObject:any){
    const event = emitObject.event;
    this.overlayRef?.dispose();
    this.overlayRef = this.overlay.create({
      scrollStrategy:this.overlay.scrollStrategies.close({
      
      }),
      positionStrategy:this.overlay.position().global().left(`${event.clientX}px`).top(`${event.clientY - 20}px`)
    });

    this.overlayRef.updatePosition();
    const componentPortal = new ComponentPortal(MessageMenuComponent);
    const componentRef = this.overlayRef.attach(componentPortal);
    componentRef.instance.message= emitObject.message;
    componentRef.instance.editMessageEmmiter.subscribe(messageToEdit => {
      this.messageToEdit = messageToEdit;
      this.overlayRef?.dispose();
    });

    componentRef.instance.replyMessageEmmiter.subscribe(messageToReply =>{
      this.messageToReply = messageToReply;
      this.overlayRef?.dispose();
    });

    componentRef.instance.forwardMessageEmmiter.subscribe(messageToForward => {
      this.redirectionService.redirectMessage(messageToForward);
      this.overlayRef?.dispose();
    });

    componentRef.instance.deleteMessageEmmiter.subscribe(messageToDelete => {
      this.messageService.deleteMessage(messageToDelete);
      this.overlayRef?.dispose();
    });
  } 

  @ViewChild('scrollframe', {static: false}) scrollFrame!: ElementRef;
  @ViewChildren('item') itemElements!: QueryList<any>;
}
