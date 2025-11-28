import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Client, Message as StompMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface UserContact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  unreadCount?: number;
}

export interface Message {
  id?: number;
  senderId: number;
  senderName?: string;
  receiverId: number;
  receiverName?: string;
  content: string;
  timestamp?: string;
  isRead?: boolean;
  conversationId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FlexibleMessagingService {
  private apiUrl = 'http://localhost:1234/api/flexible-messages';
  private wsUrl = 'http://localhost:1234/ws';
  private stompClient: Client | null = null;
  private messageSubject = new Subject<Message>();

  constructor(private http: HttpClient) {}

  // Get user contacts
  getContacts(): Observable<UserContact[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<UserContact[]>(`${this.apiUrl}/contacts`, { headers });
  }

  // Connect to conversation WebSocket
  connectToConversation(otherUserId: number): Observable<Message> {
    // Generate conversation ID (same logic as backend)
    const currentUserId = this.getCurrentUserId();
    const minId = Math.min(currentUserId, otherUserId);
    const maxId = Math.max(currentUserId, otherUserId);
    const conversationId = `${minId}_${maxId}`;

    if (!this.stompClient || !this.stompClient.connected) {
      this.stompClient = new Client({
        webSocketFactory: () => new SockJS(this.wsUrl),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        // Add auth header
        connectHeaders: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        debug: (str: string) => {
          console.log('STOMP: ' + str);
        }
      });

      this.stompClient.onConnect = (frame) => {
        console.log('Connected to WebSocket for conversation');
        // Subscribe after connection is fully established
        setTimeout(() => {
          if (this.stompClient?.connected) {
            this.stompClient.subscribe(`/topic/conversation/${conversationId}`, (message: StompMessage) => {
              const msg = JSON.parse(message.body);
              this.messageSubject.next(msg);
            });
          }
        }, 100);
      };

      this.stompClient.onStompError = (frame: any) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      };

      this.stompClient.activate();
    }

    return this.messageSubject.asObservable();
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  // Get conversation messages between current user and another user
  getConversationMessages(otherUserId: number): Observable<Message[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Message[]>(`${this.apiUrl}/conversation/${otherUserId}`, { headers });
  }

  // Send message to a specific user (not tied to reservation)
  sendMessageToUser(message: Message): Observable<Message> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<Message>(`${this.apiUrl}/send`, message, { headers });
  }

  // Get unread message count for current user
  getUnreadCount(): Observable<number> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<number>(`${this.apiUrl}/unread/count`, { headers });
  }

  private getCurrentUserId(): number {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.id || 1;
      } catch (e) {
        console.error('Error parsing token:', e);
        return 1; // Default fallback
      }
    }
    return 1;
  }
}