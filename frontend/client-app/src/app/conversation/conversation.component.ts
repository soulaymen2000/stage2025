import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexibleMessagingService, Message, UserContact } from '../services/flexible-messaging.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <div class="conversation-container">
      <div class="conversation-header" *ngIf="contact">
        <div class="contact-info">
          <div class="contact-avatar">
            <div class="avatar-initials">{{ contact.firstName.charAt(0) }}{{ contact.lastName.charAt(0) }}</div>
          </div>
          <div class="contact-details">
            <h3>{{ contact.firstName }} {{ contact.lastName }}</h3>
            <span class="contact-status">En ligne</span>
          </div>
        </div>
        <button (click)="closeConversation()" class="close-btn">×</button>
      </div>
      
      <div class="messages-container" #messagesContainer>
        <div *ngFor="let message of messages" class="message" [class.my-message]="isMyMessage(message)">
          <div class="message-content">
            <p>{{ message.content }}</p>
            <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span>
          </div>
        </div>
        
        <div class="no-messages" *ngIf="messages.length === 0">
          <p>Commencez la conversation avec {{ contact?.firstName }}</p>
        </div>
      </div>
      
      <div class="message-input-container">
        <input 
          type="text" 
          [(ngModel)]="newMessage" 
          (keyup.enter)="sendMessage()" 
          placeholder="Écrivez votre message..."
          class="message-input">
        <button (click)="sendMessage()" class="send-button" [disabled]="!newMessage.trim()">➤</button>
      </div>
    </div>
  `,
  styles: [`
    .conversation-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background-color: #fafbff;
    }
    
    .conversation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
      background-color: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    
    .contact-info {
      display: flex;
      align-items: center;
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
    
    .contact-details h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
    
    .contact-status {
      font-size: 13px;
      color: #667eea;
      font-weight: 500;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }
    
    .close-btn:hover {
      background-color: #f0f0f0;
    }
    
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      background: linear-gradient(to bottom, #f0f4ff 0%, #fafbff 100%);
    }
    
    .message {
      margin-bottom: 15px;
      display: flex;
      max-width: 80%;
    }
    
    .message.my-message {
      justify-content: flex-end;
      align-self: flex-end;
    }
    
    .message-content {
      padding: 12px 16px;
      border-radius: 18px;
      position: relative;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
      animation: fadeIn 0.3s ease;
    }
    
    .message:not(.my-message) .message-content {
      background-color: white;
      border: 1px solid #e1e5f0;
      border-top-left-radius: 5px;
    }
    
    .message.my-message .message-content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-top-right-radius: 5px;
    }
    
    .message-content p {
      margin: 0;
      line-height: 1.4;
      font-size: 15px;
    }
    
    .timestamp {
      font-size: 11px;
      opacity: 0.8;
      display: block;
      margin-top: 6px;
    }
    
    .message:not(.my-message) .timestamp {
      color: #666;
    }
    
    .message.my-message .timestamp {
      color: rgba(255, 255, 255, 0.8);
      text-align: right;
    }
    
    .no-messages {
      text-align: center;
      padding: 40px 20px;
      color: #999;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .no-messages p {
      margin: 0;
      font-size: 16px;
    }
    
    .message-input-container {
      display: flex;
      padding: 15px 20px;
      border-top: 1px solid #eee;
      background-color: white;
    }
    
    .message-input {
      flex: 1;
      padding: 12px 20px;
      border: 1px solid #e1e5f0;
      border-radius: 24px;
      outline: none;
      font-size: 15px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .message-input:focus {
      border-color: #667eea;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
    }
    
    .send-button {
      margin-left: 12px;
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
    }
    
    .send-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    
    .send-button:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @media (max-width: 768px) {
      .conversation-header {
        padding: 12px 15px;
      }
      
      .messages-container {
        padding: 15px;
      }
      
      .message {
        max-width: 90%;
      }
      
      .message-content {
        padding: 10px 14px;
      }
      
      .message-content p {
        font-size: 14px;
      }
      
      .message-input-container {
        padding: 12px 15px;
      }
      
      .message-input {
        padding: 10px 16px;
        font-size: 14px;
      }
      
      .send-button {
        width: 40px;
        height: 40px;
        font-size: 16px;
      }
    }
  `]
})
export class ConversationComponent implements OnInit, OnDestroy {
  @Input() contact: UserContact | null = null;
  @Output() conversationClosed = new EventEmitter<void>();
  
  messages: Message[] = [];
  newMessage: string = '';
  currentUserId: number = 1;
  messageSubscription: Subscription | null = null;

  constructor(private messagingService: FlexibleMessagingService) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    if (this.contact) {
      this.loadMessages();
      this.subscribeToMessages();
    }
  }

  ngOnDestroy(): void {
    this.messageSubscription?.unsubscribe();
    this.messagingService.disconnect();
  }

  ngOnChanges(): void {
    if (this.contact) {
      this.loadMessages();
      this.subscribeToMessages();
    }
  }

  loadCurrentUser(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserId = payload.userId || payload.id || 1;
      } catch (e) {
        console.error('Error parsing token:', e);
        this.currentUserId = 1; // Default fallback
      }
    }
  }

  loadMessages(): void {
    if (!this.contact) return;
    
    this.messagingService.getConversationMessages(this.contact.id).subscribe({
      next: (messages: Message[]) => {
        this.messages = messages;
        this.scrollToBottom();
      },
      error: (error: any) => {
        console.error('Error loading messages:', error);
      }
    });
  }

  subscribeToMessages(): void {
    if (!this.contact) return;
    
    this.messageSubscription = this.messagingService.connectToConversation(this.contact.id).subscribe({
      next: (message: Message) => {
        this.messages.push(message);
        this.scrollToBottom();
      },
      error: (error: any) => {
        console.error('WebSocket error:', error);
      }
    });
  }

  sendMessage(): void {
    const trimmedMessage = this.newMessage.trim();
    if (!trimmedMessage || !this.contact) {
      return;
    }

    const message: Message = {
      senderId: this.currentUserId,
      receiverId: this.contact.id,
      content: trimmedMessage
    };

    this.messagingService.sendMessageToUser(message).subscribe({
      next: (sentMessage: Message) => {
        // Message will be received via WebSocket
        this.newMessage = '';
      },
      error: (error: any) => {
        console.error('Error sending message:', error);
        // Show user-friendly error message
        alert('Failed to send message. Please try again.');
      }
    });
  }

  isMyMessage(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  formatTimestamp(timestamp: string | undefined): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  closeConversation(): void {
    this.conversationClosed.emit();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.querySelector('.messages-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
}