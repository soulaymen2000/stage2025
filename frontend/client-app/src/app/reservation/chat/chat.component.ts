import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagingService, Message } from '../../services/messaging.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() reservationId!: number | string;
  @Input() currentUserId!: number;
  @Input() otherUserId!: number;

  messages: Message[] = [];
  newMessage: string = '';
  private messageSubscription?: Subscription;

  constructor(private messagingService: MessagingService) {}

  ngOnInit(): void {
    this.loadMessages();
    this.subscribeToMessages();
  }

  ngOnDestroy(): void {
    this.messageSubscription?.unsubscribe();
    this.messagingService.disconnect();
  }

  loadMessages(): void {
    const resId = typeof this.reservationId === 'string' ? parseInt(this.reservationId) : this.reservationId;
    this.messagingService.getMessagesByReservation(resId).subscribe({
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
    const resId = typeof this.reservationId === 'string' ? parseInt(this.reservationId) : this.reservationId;
    this.messageSubscription = this.messagingService.connect(resId).subscribe({
      next: (message: Message) => {
        this.messages.push(message);
        this.scrollToBottom();
        
        // Mark as read if received
        if (message.receiverId === this.currentUserId && message.id) {
          this.messagingService.markAsRead(message.id).subscribe();
        }
      },
      error: (error: any) => {
        console.error('WebSocket error:', error);
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) {
      return;
    }

    const resId = typeof this.reservationId === 'string' ? parseInt(this.reservationId) : this.reservationId;
    const message: Message = {
      reservationId: resId,
      senderId: this.currentUserId,
      receiverId: this.otherUserId,
      content: this.newMessage.trim()
    };

    this.messagingService.sendMessage(message).subscribe({
      next: (sentMessage: Message) => {
        // Message will be received via WebSocket
        this.newMessage = '';
      },
      error: (error: any) => {
        console.error('Error sending message:', error);
      }
    });
  }

  isMyMessage(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
}
