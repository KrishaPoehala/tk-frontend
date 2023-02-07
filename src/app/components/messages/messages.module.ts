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

@NgModule({
  declarations: [
    MessagesListComponent,
    MessageItemComponent,
    MessageMenuComponent,
  ],
  imports: [
    MatTooltipModule,
    MatIconModule,
    BrowserModule,
    ScrollingModule,
    BrowserAnimationsModule,
    MatMenuModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  exports:[MessagesListComponent,MessageItemComponent],
  providers:[NgbActiveModal,NgbModal]
})
export class MessagesModule { }