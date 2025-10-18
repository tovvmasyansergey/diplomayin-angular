import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage, ChatNotification } from '../models/chat-message.model';

declare const SockJS: any;
declare const Stomp: any;

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: any;
  private connected = new BehaviorSubject<boolean>(false);
  private messages = new BehaviorSubject<ChatMessage[]>([]);

  constructor() { }

  connect(userId: number): void {
    console.log('🔌 Connecting to WebSocket...');
    console.log('🔌 User ID:', userId);
    console.log('🔌 SockJS available:', typeof SockJS !== 'undefined');
    console.log('🔌 Stomp available:', typeof Stomp !== 'undefined');
    
    try {
      // Используем SockJS для совместимости с бэкендом
      const socket = new SockJS('http://localhost:7404/ws');
      console.log('🔌 SockJS socket created:', socket);
      this.stompClient = Stomp.over(socket);
      console.log('🔌 Stomp client created:', this.stompClient);
      
      this.stompClient.connect({}, (frame: any) => {
        console.log('✅ WebSocket connected:', frame);
        this.connected.next(true);
        
        // Подписываемся на личные сообщения
        this.stompClient.subscribe(`/user/${userId}/queue/messages`, (message: any) => {
          console.log('💬 Received message:', message.body);
          try {
            const notification: ChatNotification = JSON.parse(message.body);
            console.log('💬 Parsed notification:', notification);
            
            // Конвертируем уведомление в ChatMessage
            const chatMessage: ChatMessage = {
              id: notification.id,
              content: notification.content,
              senderId: notification.senderId,
              recipientId: notification.receiverId,
              timestamp: new Date(),
              messageType: 'TEXT'
            };
            
            console.log('💬 Converted to ChatMessage:', chatMessage);
            this.addMessage(chatMessage);
          } catch (error) {
            console.error('❌ Error parsing message:', error);
          }
        });
        
        console.log('📡 Subscribed to messages for user:', userId);
      }, (error: any) => {
        console.error('❌ WebSocket error:', error);
        this.connected.next(false);
      });
      
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      this.connected.next(false);
    }
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
      this.connected.next(false);
    }
  }

  sendMessage(message: ChatMessage): void {
    if (this.stompClient && this.connected.value) {
      console.log('📤 Sending message:', message);
      this.stompClient.send("/app/chat", {}, JSON.stringify(message));
    } else {
      console.error('❌ WebSocket not connected');
    }
  }

  getConnected(): Observable<boolean> {
    return this.connected.asObservable();
  }

  getMessages(): Observable<ChatMessage[]> {
    return this.messages.asObservable();
  }

  setMessages(messages: ChatMessage[]): void {
    this.messages.next(messages);
  }

  private addMessage(message: ChatMessage): void {
    const currentMessages = this.messages.value;
    this.messages.next([...currentMessages, message]);
  }
}