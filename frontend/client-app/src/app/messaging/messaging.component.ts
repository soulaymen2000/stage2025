import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactsComponent } from '../contacts/contacts.component';
import { ConversationComponent } from '../conversation/conversation.component';
import { UserContact } from '../services/flexible-messaging.service';
import { SharedModule } from '../shared/shared-module';

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [
    CommonModule,
    ContactsComponent,
    ConversationComponent,
    SharedModule
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="messaging-layout">
      <!-- Header -->
      <div class="messaging-header">
        <h1>💬 Messagerie</h1>
        <p>Connectez-vous avec vos clients et fournisseurs</p>
      </div>
      
      <!-- Main Content -->
      <div class="messaging-container">
        <div class="contacts-panel" [class.collapsed]="selectedContact && isMobileView">
          <div class="panel-header">
            <h2>Contacts</h2>
          </div>
          <app-contacts (contactSelected)="onContactSelected($event)"></app-contacts>
        </div>
        
        <div class="conversation-panel" *ngIf="selectedContact">
          <app-conversation 
            [contact]="selectedContact" 
            (conversationClosed)="onConversationClosed()">
          </app-conversation>
        </div>
        
        <div class="no-conversation" *ngIf="!selectedContact">
          <div class="welcome-message">
            <h2>👋 Bienvenue dans la messagerie</h2>
            <p>Sélectionnez un contact pour commencer à discuter</p>
            <div class="illustration">💬</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .messaging-layout {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 64px); /* Adjust based on navbar height */
      background-color: #f5f7fa;
    }
    
    .messaging-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .messaging-header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
    }
    
    .messaging-header p {
      margin: 0.5rem 0 0 0;
      opacity: 0.9;
      font-size: 1rem;
    }
    
    .messaging-container {
      display: flex;
      flex: 1;
      background-color: white;
      margin: 1rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }
    
    .panel-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #eee;
      background-color: #fafbff;
    }
    
    .panel-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
    }
    
    .contacts-panel {
      width: 320px;
      border-right: 1px solid #eee;
      background-color: white;
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease;
    }
    
    .contacts-panel.collapsed {
      transform: translateX(-100%);
      position: absolute;
      z-index: 100;
    }
    
    .conversation-panel {
      flex: 1;
      display: flex;
      min-width: 0; /* Fix for flexbox overflow */
    }
    
    .no-conversation {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #fafbff;
    }
    
    .welcome-message {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
    
    .welcome-message h2 {
      margin-bottom: 1rem;
      color: #333;
      font-size: 1.5rem;
    }
    
    .welcome-message p {
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }
    
    .illustration {
      font-size: 4rem;
      opacity: 0.7;
    }
    
    @media (max-width: 768px) {
      .messaging-header {
        padding: 1rem;
      }
      
      .messaging-container {
        margin: 0.5rem;
        border-radius: 8px;
      }
      
      .contacts-panel {
        width: 100%;
        position: absolute;
        z-index: 100;
        background-color: white;
        height: calc(100% - 2rem);
      }
      
      .contacts-panel:not(.collapsed) {
        transform: translateX(0);
      }
      
      .conversation-panel {
        width: 100%;
      }
      
      .panel-header {
        padding: 0.75rem 1rem;
      }
    }
  `]
})
export class MessagingComponent implements OnInit {
  selectedContact: UserContact | null = null;
  isMobileView: boolean = window.innerWidth <= 768;

  constructor() {
    this.checkMobileView();
    window.addEventListener('resize', () => this.checkMobileView());
  }

  ngOnInit(): void {}

  onContactSelected(contact: UserContact): void {
    this.selectedContact = contact;
  }

  onConversationClosed(): void {
    this.selectedContact = null;
  }

  private checkMobileView(): void {
    this.isMobileView = window.innerWidth <= 768;
    if (!this.isMobileView && this.selectedContact) {
      // Reset collapsed state when switching to desktop view
      const contactsPanel = document.querySelector('.contacts-panel');
      if (contactsPanel) {
        contactsPanel.classList.remove('collapsed');
      }
    }
  }
}