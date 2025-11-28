import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MessagingComponent } from './messaging.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { ConversationComponent } from '../conversation/conversation.component';
import { SidebarComponent } from '../shared/sidebar';

const routes: Routes = [
  { path: '', component: MessagingComponent }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    MessagingComponent,
    ContactsComponent,
    ConversationComponent,
    SidebarComponent
  ]
})
export class MessagingModule { }