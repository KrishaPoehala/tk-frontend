import { CursorPositionsService } from './../../../services/cursor-positions.service';
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
import { AfterViewInit, ChangeDetectionStrategy, Component, DoCheck, ElementRef, Input, IterableDiffers, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageDto } from 'src/app/dtos/MessageDto';
import { MessageStatus } from 'src/app/enums/message-status';
import { NewMessageDto } from 'src/app/dtos/NewMessageDto';
import { __values } from 'tslib';
import { SelectedChatChangedService } from 'src/app/services/selected-chat-changed.service';
import { Observer } from 'rxjs';
import { ChatDto } from 'src/app/dtos/ChatDto';

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
    readonly permissionsService:PermissionsService,private cursorPositions:CursorPositionsService,
    private selectedChatService:SelectedChatChangedService) {
     }


  $(id:string){
    return document.getElementById(id);
  }

  isAtTheBottom:boolean = true;
  newMessage:MessageDto | null = null;
  ngOnChanges(changes: SimpleChanges): void {
    const currentValue:MessageDto[] = changes['messages'].currentValue;
    const diff = currentValue[currentValue.length - 1];
    console.log('SUBSCRIBING');
    this.selectedChatService.set[this.userService.selectedChat.value.id]
    .subscribe(chat => {
      this.onSelectedChatChangeHandler(chat);
    });
    if(!diff){
      return;
    }

    this.isCurrentUsersMessage = diff.sender.user.id === this.userService.currentUser.id;
    this.newMessage = this.isCurrentUsersMessage ? null : diff;
  }
  isCurrentUsersMessage:boolean = true;
  @Input() messages!:MessageDto[];
  callsCount: {[id:number]:number} = {};
  ngOnInit(): void {
    console.log('On initi called!');
    if(this.userService.selectedChat.value.id === -1){
      return;
    }

    console.log(this.selectedChatService.set[this.userService.selectedChat.value.id]);
    this.selectedChatService.set[this.userService.selectedChat.value.id].unsubscribe();
    this.selectedChatService.set[this.userService.selectedChat.value.id]
    .subscribe(chat => {
      this.onSelectedChatChangeHandler(chat);
    });
  }

  onSelectedChatChangeHandler(chat:ChatDto){
    this.callsCount[chat.id]++;
    console.log('EMMITER SUBSCRIBER CALLED', this.callsCount)
    if(this.callsCount[chat.id] > 1){
      return;
    }

    if(!this.messages){
      return;
    }
      
    if(chat.id !== this.userService.selectedChat.value.id){
      return;
    }
      
    const unreadMessagesLength = chat.members
      .find(x => x.user.id === this.userService.currentUser.id)!.unreadMessagesLength;
    if(isNaN(unreadMessagesLength) || unreadMessagesLength === 0){
      this.scrollToBottom(true);
      return;
    }

    const messageToScrollTo = this.messages[this.messages.length - unreadMessagesLength];
    console.log(messageToScrollTo)
    const id = new Date(messageToScrollTo.sentAt).getTime().toString();
    this.$(id)?.scrollIntoView({
      behavior:'auto',
      block: 'center',
      inline: 'center',
    })

    const intersection = new IntersectionObserver((entries,obs) => {
      this.onIntersection(chat,entries,obs);
    },{
      root:document.querySelector('#scrollframe'),
      }
    );

    for(let i = this.messages.length - unreadMessagesLength; i < this.messages.length; ++i){
      const id = new Date(this.messages[i].sentAt).getTime().toString();
      intersection.observe(this.$(id)!);
    }

    chat.members = Array.prototype.concat(chat.members);
  }

  onIntersection(chat:ChatDto,entries:IntersectionObserverEntry[],obs:IntersectionObserver){
    console.log(entries);
    const member = chat.members
    .find(x => x.user.id === this.userService.currentUser.id)!;
    entries.forEach(x => {
      if(x.intersectionRatio <= 0.0005){
        return;
      }

      member.unreadMessagesLength--;
      obs.unobserve(x.target);
    })

    chat.members = Array.prototype.concat(chat.members);
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

    this.sendingMessage = true;
    let newMessage = new NewMessageDto(text,this.userService.currentUserAsMember,
    this.userService.selectedChat?.value.id, new Date(),this.messageToReply);
    this.userService.selectedChat.value.messages = Array.prototype.concat(this.userService.selectedChat.value.messages);
    this.userService.selectedChat.value.messages.push(this.toMessage(newMessage));
    this.userService.chats.value = Array.prototype.concat(this.userService.chats.value);
    this.http.sendMessage(newMessage).subscribe(_ => this.sendingMessage = false);
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
  scrollCallsCount = 0;
  isWorking = false;
  currentPage = 1;
  sendMessage = Permissions[Permissions.SendMessages];
  onScroll(event:any){
    if(this.userService.selectedChat.value.id === -1){
      return;
    }
    
    ++this.scrollCallsCount;
    if(!this.userService.selectedChat || this.scrollCallsCount === 1){
      return;
    }

    const epsilon = -100;
    this.isAtTheBottom = event.target.offsetHeight + event.target.scrollTop - event.target.scrollHeight >= epsilon;
    this.cursorPositions.set[this.userService.selectedChat.value.id] = this.isAtTheBottom;
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
      
      ++this.currentPage;
      this.isAtTheBottom = false;
      r.forEach(element => {
        element.status = MessageStatus.Delivered;
        this.userService.selectedChat?.value.messages.unshift(element);
        })
      });

    setTimeout(() => this.isWorking = false, 600);//forbid to call this method too many times
  }

  sendingMessage = false;
  count = 0;
  
  @ViewChild('scrollframe', {static: false}) scrollFrame!: ElementRef;
  @ViewChildren('item') itemElements!: QueryList<any>;
  ngAfterViewInit(): void {
    this.itemElements.changes.subscribe(x => {
      this.scrollToBottom();
    });
  }

  private scrollToBottom(ignoreSendingMessage:boolean = true): void {
    if( ignoreSendingMessage && !this.sendingMessage){
      return;
    }

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
