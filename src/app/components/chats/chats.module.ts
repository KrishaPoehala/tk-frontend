import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatItemComponent } from './chat-item/chat-item.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ChatInfoComponent } from './chat-info/chat-info.component';
import { ChatDetailsComponent } from './chat-details/chat-details.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MenuComponent } from './menu/menu.component';
import { MessagesModule } from '../messages/messages.module';
import { EmptyChatListComponent } from './empty-chat-list/empty-chat-list.component';
import { OrderChatPipe } from './pipes/order-chat.pipe';
@NgModule({
    declarations: [
        ChatListComponent,
        ChatItemComponent,
        ChatInfoComponent,
        ChatDetailsComponent,
        MenuComponent,
        EmptyChatListComponent,
        OrderChatPipe,
    ],
    exports: [
        ChatListComponent,
        ChatItemComponent,
        ChatInfoComponent,
        ChatDetailsComponent,
        MenuComponent,
        EmptyChatListComponent,
    ],
    imports: [
        NgbDropdownModule,
        MatIconModule,
        CommonModule,
        MessagesModule,
        ReactiveFormsModule,
        
    ]
})
export class ChatsModule { }
