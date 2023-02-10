import { Permissions } from './../../../enums/permissions';
import { PermissionsService } from './../../../services/permissions.service';
import { RedirectionService } from 'src/app/services/redirection.service';
import { ComponentPortal } from '@angular/cdk/portal';
import { MessageMenuComponent } from './../message-menu/message-menu.component';
import { Overlay } from '@angular/cdk/overlay';
import { OverlayRef } from '@angular/cdk/overlay';
import { MessageService } from './../../../services/message-sender.service';
import { UserService } from 'src/app/services/user.service';
import { HttpService } from 'src/app/services/http.service';
import { AfterViewInit, ChangeDetectionStrategy, Component, DoCheck, ElementRef, Input, IterableDiffers, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageDto } from 'src/app/dtos/MessageDto';
import { MessageStatus } from 'src/app/enums/message-status';
import { NewMessageDto } from 'src/app/dtos/NewMessageDto';
import { __values } from 'tslib';

@Component({
  selector: 'app-messages-list',
  templateUrl: './messages-list.component.html',
  styleUrls: ['./messages-list.component.css'], 
  changeDetection: ChangeDetectionStrategy.Default
})
export class MessagesListComponent implements OnInit, AfterViewInit,DoCheck {

  constructor(private fb:FormBuilder, private http: HttpService,
    public readonly userService: UserService,private messageService:MessageService,
    private overlay:Overlay,private redirectionService:RedirectionService,
    readonly permissionsService:PermissionsService) {
     }
  ngDoCheck(): void {
    this.observers = {};
  }

  $(id:string){
    return document.getElementById(id);
  }

  observers!:{[id:number]:IntersectionObserver}
  isAtTheBottom:boolean = true;
  newMessage:MessageDto | null = null;
  ngOnChanges(changes: SimpleChanges): void {
    const currentValue:MessageDto[] = changes['messages'].currentValue;
    const diff = currentValue[currentValue.length - 1];
    console.log('FROM ON CHANGES NEW MESSAGE')
    console.log(diff);
    if(!diff){
      return;
    }

     this.isCurrentUsersMessage = diff.sender.user.id === this.userService.currentUser.id;
    this.newMessage = this.isCurrentUsersMessage ? null : diff;
  }
  isCurrentUsersMessage:boolean = true;
  @Input() messages!:MessageDto[];
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
    if(this.messageForm.invalid || this.userService.selectedChat?.value.id === -1){
      return;
    }

    const text = this.messageForm.controls.message.value?.trim() || "";
    if(!text){
      return;
    }

    if(this.messageToEdit){
      const messageIndex = this.messages
                        .findIndex(x => x.id === this.messageToEdit?.id);
      this.messages[messageIndex].text = text;
      this.http.editMessage(this.messageToEdit.id, text)
      .subscribe();
      this.messageToEdit = null;
      this.messageForm.controls.message.setValue('');
      return;
    }
    
    if(!this.userService.currentUserAsMember){
      this.userService.setCurrentUserAsMember();
    }

    let newMessage = new NewMessageDto(text,this.userService.currentUserAsMember,
    this.userService.selectedChat?.value.id, new Date(),this.messageToReply);
    this.userService.selectedChat.value.messages = Array.prototype.concat(this.userService.selectedChat.value.messages);
    this.userService.selectedChat.value.messages.push(this.toMessage(newMessage));
    this.userService.chats = Array.prototype.concat(this.userService.chats);
    this.http.sendMessage(newMessage).subscribe() ;
    this.messageForm.controls.message.setValue('');
    this.messageToReply = null;
  }

  private toMessage(newMessage:NewMessageDto){
    const message = new MessageDto(-1,newMessage.text,newMessage.sender,newMessage.chatId,newMessage.sentAt,null,
      newMessage.replyMessage);
    message.status = MessageStatus.InProgress;
    return message;
  }

  messagesToLoad=20;
  callsCount = 0;
  isWorking = false;
  currentPage = 1;
  sendMessage = Permissions[Permissions.SendMessages];
  onScroll(event:any){
    if(this.userService.selectedChat.value.id === -1){
      return;
    }
    
    ++this.callsCount;
    if(!this.userService.selectedChat || this.callsCount === 1){
      return;
    }

    const epsilon = -90;
    this.isAtTheBottom = event.target.offsetHeight + event.target.scrollTop - event.target.scrollHeight >= epsilon;
    const top = this.scrollFrame.nativeElement.scrollTop;
    if(top !== 0 || this.isWorking){
      return;
    }

    this.isWorking = true;
    this.scrollFrame.nativeElement.scrollTop = 100;
    this.http.getChatMessages(this.userService.selectedChat.value.id, this.userService.currentUser.id, 
      this.currentPage, this.messagesToLoad)
    .subscribe(r =>{
        if(r.length === 0){
          return;
        }
        
        ++this.currentPage
        this.isAtTheBottom = false;
          r.forEach(element => {
            element.status = MessageStatus.Delivered;
            this.userService.selectedChat?.value.messages.unshift(element);
          })
        });

        
    setTimeout(() => this.isWorking = false, 600);//forbid to call this method too many times
  }

  count = 0;
  @ViewChild('scrollframe', {static: false}) scrollFrame!: ElementRef;
  @ViewChildren('item') itemElements!: QueryList<any>;
  ngAfterViewInit(): void {
    this.scrollToBottom();
    this.itemElements.changes.subscribe(_ => {
      this.scrollToBottom();
      if(!this.newMessage){
        return;
      }
        
      const id = new Date(this.newMessage.sentAt).getTime().toString();
      const el = this.$(id);
      if(this.userService.selectedChat.value.id !== this.newMessage.chatId || !this.isAtTheBottom){
        return;
      }

      if(this.observers[this.newMessage.chatId]){
        console.log('added obs: to' + this.newMessage.chatId);
        this.observers[this.newMessage.chatId].observe(el!);
      }
      else{
        this.observers[this.newMessage.chatId] = new IntersectionObserver((entries, obs) => {
          this.onInstersection(entries,obs,this.newMessage!.chatId);
        },
        {
          root: this.scrollFrame.nativeElement,
        })

        this.observers[this.newMessage.chatId].observe(el!);
        console.log('created new obs');
      }
    });
  }

  onInstersection(entires :IntersectionObserverEntry[],obs:IntersectionObserver,chatId:number){
    console.log(entires);
    const chat = this.userService.chats.find(x => x.id === chatId)!;
    console.log("chat: ", chat);
    chat.unreadMessagesLength = entires.length;
    this.userService.chats = Array.prototype.concat(this.userService.chats);
    entires.forEach(e => obs.unobserve(e.target));
  } 

  private scrollToBottom(): void {
    console.log(this.isAtTheBottom, this.isCurrentUsersMessage);
    if(this.isAtTheBottom || this.isCurrentUsersMessage){
      this.scrollFrame.nativeElement.scrollTop = this.scrollFrame.nativeElement.scrollHeight;
      return;
    }
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


}
