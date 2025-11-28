import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FlexibleMessagingService, UserContact } from '../services/flexible-messaging.service';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule
  ],
  template: `
    <div class="contacts-container">
      <div class="search-container">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="filterContacts()" 
            placeholder="Rechercher un contact..."
            class="search-input">
        </div>
      </div>
      
      <div class="contacts-list">
        <div 
          *ngFor="let contact of filteredContacts" 
          class="contact-item"
          [class.active]="selectedContact?.id === contact.id"
          (click)="selectContact(contact)">
          <div class="contact-avatar">
            <div class="avatar-initials">{{ contact.firstName.charAt(0) }}{{ contact.lastName.charAt(0) }}</div>
          </div>
          <div class="contact-info">
            <div class="contact-name">{{ contact.firstName }} {{ contact.lastName }}</div>
            <div class="contact-details">
              <span class="contact-role">{{ contact.role }}</span>
              <span class="contact-email">{{ contact.email }}</span>
            </div>
          </div>
          <div class="contact-unread" *ngIf="contact.unreadCount && contact.unreadCount > 0">
            {{ contact.unreadCount }}
          </div>
        </div>
        
        <div class="no-contacts" *ngIf="filteredContacts.length === 0">
          <p>Aucun contact trouvé</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contacts-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .search-container {
      padding: 15px;
      border-bottom: 1px solid #eee;
      background-color: #fafbff;
    }
    
    .search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .search-icon {
      position: absolute;
      left: 12px;
      color: #999;
      font-size: 14px;
      z-index: 1;
    }
    
    .search-input {
      width: 100%;
      padding: 10px 15px 10px 35px;
      border: 1px solid #e1e5f0;
      border-radius: 24px;
      outline: none;
      background-color: white;
      font-size: 14px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
      transition: box-shadow 0.2s, border-color 0.2s;
    }
    
    .search-input:focus {
      border-color: #667eea;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
    }
    
    .contacts-list {
      flex: 1;
      overflow-y: auto;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      padding: 15px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }
    
    .contact-item:hover {
      background-color: #f8f9ff;
    }
    
    .contact-item.active {
      background-color: #eef4ff;
      border-left: 3px solid #667eea;
    }
    
    .contact-avatar {
      margin-right: 12px;
    }
    
    .avatar-initials {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 16px;
    }
    
    .contact-info {
      flex: 1;
      min-width: 0; /* Fix for flexbox overflow */
    }
    
    .contact-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
      font-size: 15px;
    }
    
    .contact-details {
      display: flex;
      flex-direction: column;
    }
    
    .contact-role {
      font-size: 12px;
      color: #667eea;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .contact-email {
      font-size: 13px;
      color: #666;
      margin-top: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .contact-unread {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      color: white;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      box-shadow: 0 2px 5px rgba(255, 107, 107, 0.3);
    }
    
    .no-contacts {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }
    
    .no-contacts p {
      margin: 0;
      font-size: 16px;
    }
    
    @media (max-width: 768px) {
      .search-container {
        padding: 12px;
      }
      
      .contact-item {
        padding: 12px;
      }
      
      .avatar-initials {
        width: 36px;
        height: 36px;
        font-size: 14px;
      }
      
      .contact-name {
        font-size: 14px;
      }
    }
  `]
})
export class ContactsComponent implements OnInit {
  @Output() contactSelected = new EventEmitter<UserContact>();
  
  contacts: UserContact[] = [];
  filteredContacts: UserContact[] = [];
  searchTerm: string = '';
  selectedContact: UserContact | null = null;

  constructor(private messagingService: FlexibleMessagingService) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.messagingService.getContacts().subscribe({
      next: (contacts: UserContact[]) => {
        this.contacts = contacts;
        this.filteredContacts = [...contacts];
      },
      error: (error: any) => {
        console.error('Error loading contacts:', error);
      }
    });
  }

  filterContacts(): void {
    if (!this.searchTerm) {
      this.filteredContacts = [...this.contacts];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredContacts = this.contacts.filter(contact => 
      contact.firstName.toLowerCase().includes(term) ||
      contact.lastName.toLowerCase().includes(term) ||
      contact.email.toLowerCase().includes(term)
    );
  }

  selectContact(contact: UserContact): void {
    this.selectedContact = contact;
    this.contactSelected.emit(contact);
  }
}