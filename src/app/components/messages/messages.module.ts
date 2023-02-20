import { BrowserModule } from '@angular/platform-browser';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessagesListComponent } from './messages-list/messages-list.component';
import { MessageItemComponent } from './message-item/message-item.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIcon, MatIconModule, MatMenuModule, MatTooltipModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MessageMenuComponent } from './message-menu/message-menu.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { LastReadComponent } from './last-read/last-read.component';

@NgModule({
    declarations: [
        MessagesListComponent,
        MessageItemComponent,
        MessageMenuComponent,
        LastReadComponent,
    ],
    exports: [MessagesListComponent, MessageItemComponent],
    providers: [NgbActiveModal, NgbModal],
    imports: [
        MatTooltipModule,
        MatIconModule,
        BrowserModule,
        ScrollingModule,
        BrowserAnimationsModule,
        MatMenuModule,
        CommonModule,
        ReactiveFormsModule,
    ]
})
export class MessagesModule { }
