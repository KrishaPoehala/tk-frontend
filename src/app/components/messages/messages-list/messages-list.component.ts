import { ChatMemberDto } from './../../../dtos/ChatMemberDto';
import { LastReadComponent } from './../last-read/last-read.component';
import { MessageSentDto } from './../../../dtos/MessageSentDto';
import { UnreadMessagesService } from './../../../services/unread-messages.service';
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
    private selectedChatService:SelectedChatChangedService,private unreadService:UnreadMessagesService) {
     }

  $(id:string){
    return document.getElementById(id);
  }

  isAtTheBottom:boolean = true;
  isCurrentUsersMessage:boolean = true;
  @Input() messages!:MessageDto[] | undefined;
  forbidScrolling = true;
  ngOnInit(): void {
    this.selectedChatService.chatSelectionChangedEmitter.subscribe(dto => 
      this.onSelectedChatChangeHandler(dto)
    );
  }

  lastReadMessage: MessageDto | null = null;
  observedMessagesCount = 0;
  onSelectedChatChangeHandler(model:MessageSentDto){
    const chat = model.chat;
    this.forbidScrolling = true;
    if(!this.messages){
      return;
    }
      
    const member = this.userService.currentUserAsMember;
    const unreadMessagesLength = member?.unreadMessagesLength;
    if(!unreadMessagesLength || isNaN(unreadMessagesLength) || unreadMessagesLength === 0){
      this.lastReadMessage = null;
      this.scrollToBottom(true);
      this.forbidScrolling = false;
      return;
    }

    if(this.scrollFrame.nativeElement.scrollHeight <= this.scrollFrame.nativeElement.clientHeight){
      this.http.saveReadMessages(member.id, this.messages).subscribe();
      this.lastReadMessage = null;
      this.cursorPositions.set[chat.id] = true;
      member.unreadMessagesLength = 0;
      this.forbidScrolling = false;
      return;
    } 


    const messageToScrollTo = this.messages[this.messages.length - unreadMessagesLength];
    const id = messageToScrollTo.id.toString();
    let firstUnreadMessage = this.$(id);
    if(model.scroll){
      this.forbidScrolling = true;
      this.lastReadMessage = messageToScrollTo;
    }
    
    let intersection: IntersectionObserver;
    if(this.unreadService.intersectionObjects[chat.id]){
      intersection = this.unreadService.intersectionObjects[chat.id];
    }
    else{
      intersection =new IntersectionObserver((entries,obs) => {
        this.onIntersection(chat,entries,obs);
      },{
        root:this.scrollFrame.nativeElement,
        }
      );

      this.unreadService.intersectionObjects[chat.id] = intersection;
    }

    const records = intersection.takeRecords();
    this.observedMessagesCount = Math.min(100, unreadMessagesLength);
    console.log(this.observedMessagesCount);
    for(let i = this.messages.length - unreadMessagesLength; i < this.messages.length; ++i){
      const id =this.messages[i].id.toString();
      if(records.some(x => x.target.getAttribute(id) === id)){
        continue;
      }
      
      const target = this.$(id);
      if(target){
        intersection.observe(target);
      }
    } 

    if(model.scroll){
      firstUnreadMessage?.scrollIntoView({
        behavior:'auto',
        block: 'end',
        inline: 'end',
      });
    }
    chat.members = Array.prototype.concat(chat.members);
    this.forbidScrolling = false;
  }

  observeWithPagination(obs:IntersectionObserver, member:ChatMemberDto){

  }
  onIntersection(chat:ChatDto,entries:IntersectionObserverEntry[],obs:IntersectionObserver){
    const member = this.userService.currentUserAsMember!;
      entries.forEach(x => {
      if(x.intersectionRatio <= 0.00005){
        return;
      }

      const messageId = Number(x.target.getAttribute('id')!);
      const message = this.messages?.find(x => x.id === messageId)!;
      if(!message.readBy?.some(x => x.user.id === this.userService.currentUser.id)){
        this.http.saveReadMessages(member.id,[message])
        .subscribe(_ => {
          this.unreadService.messagesReadSet[member.chatId] = [];
        });
      }

      this.observedMessagesCount--;
      member.unreadMessagesLength--;
      obs.unobserve(x.target);
      if(this.observedMessagesCount === 0 && member.unreadMessagesLength !== 0){
        this.observedMessagesCount = Math.min(100, member.unreadMessagesLength);
      }
    })

    if(this.cursorPositions.isAtTheBottom(chat.id)){
      member.unreadMessagesLength = 0;
    }

    chat.members = Array.prototype.concat(chat.members);
  }

  messageForm = this.fb.group({
    message: ['',Validators.required],
  });

  messageToReply:MessageDto | null = null;
  diff = 0;
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
      const messageIndex = this.messages!
                        .findIndex(x => x.id === this.messageToEdit?.id);
      this.messages![messageIndex].text = text;
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
    const date = new Date();
    date.setMilliseconds(this.diff++);
    let newMessage = new NewMessageDto(text,this.userService.currentUserAsMember,
    this.userService.selectedChat?.value.id,date,this.messageToReply);
    this.userService.selectedChat.value.messages = Array.prototype.concat(this.userService.selectedChat.value.messages);
    this.userService.selectedChat.value.messages.push(this.toMessage(newMessage));
    this.userService.chats.value = Array.prototype.concat(this.userService.chats.value);
    this.http.sendMessage(newMessage).subscribe(_ => {
      this.sendingMessage = false
    });
    this.messageForm.controls.message.setValue('');
    this.messageToReply = null;
  }

  private toMessage(newMessage:NewMessageDto){
    const message = new MessageDto(-1,newMessage.text,newMessage.sender,newMessage.chatId,newMessage.sentAt,null,
      newMessage.replyMessage,null,false);
    message.status = MessageStatus.InProgress;
    return message;
  }

  messagesToLoad=20;
  scrollCallsCount = 0;
  isWorking = false;
  currentPagesSet :{[id:number]:number} = {};
  sendMessage = Permissions[Permissions.SendMessages];
  onScroll(event:any){
    if(this.userService.selectedChat.value.id === -1 || this.forbidScrolling){
      return;
    }
    
    ++this.scrollCallsCount;
    if(!this.userService.selectedChat || this.scrollCallsCount === 1){
      return;
    }

    const epsilon = -250;
    this.isAtTheBottom = event.target.offsetHeight + event.target.scrollTop - event.target.scrollHeight >= epsilon;
    this.cursorPositions.set[this.userService.selectedChat.value.id] = this.isAtTheBottom;
    const top = this.scrollFrame.nativeElement.scrollTop;
    const heigth = this.scrollFrame.nativeElement.scrollHeight;
    const percentages = top / heigth * 100;
    if(percentages > 20 || this.isWorking){
      return; 
    }

    this.isWorking = true;
    this.scrollFrame.nativeElement.scrollTop = top;
    const currentChatId = this.userService.selectedChat.value.id;
    let currentPage = 0;
    if(!this.currentPagesSet[currentChatId]){
      this.currentPagesSet[currentChatId] = 1;
      currentPage = 1;
    }
    else{
      currentPage = this.currentPagesSet[currentChatId];
    }
    
    this.http.getChatMessages(this.userService.selectedChat.value.id, this.userService.currentUser.id, 
     currentPage, this.messagesToLoad)
    .subscribe(r =>{
      if(r.length === 0){
        return;
      }
      
      ++this.currentPagesSet[currentChatId];
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
  @ViewChildren('item') itemElements!: QueryList<ElementRef>;
  ngAfterViewInit(): void {
    this.itemElements.changes.subscribe((change: QueryList<ElementRef>) => {
      this.scrollToBottom();
    });
  }

  private scrollToBottom(ignoreSendingMessage:boolean = false): void {
    if( ignoreSendingMessage){
      return;
    }
    
    if(this.isAtTheBottom || this.sendingMessage){
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
