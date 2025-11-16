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
  private newMessage = new BehaviorSubject<ChatMessage | null>(null);

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

      // Отключаем отладочные сообщения STOMP для чистоты консоли
      this.stompClient.debug = () => {}; // Отключаем дебаг логи STOMP

      this.stompClient.connect({}, (frame: any) => {
        console.log('✅ WebSocket connected successfully:', frame);
        this.connected.next(true);

        // Подписываемся на личные сообщения через общий топик
        const subscriptionDestination = `/topic/user/${userId}`;
        console.log('📡 Subscribing to:', subscriptionDestination);

        const subscription = this.stompClient.subscribe(subscriptionDestination, (message: any) => {
          console.log('💬 Received WebSocket message on', subscriptionDestination, ':', message.body);
          try {
            const notification: ChatNotification = JSON.parse(message.body);
            console.log('💬 Parsed notification:', notification);

            // Конвертируем уведомление в ChatMessage
            const chatMessage: ChatMessage = {
              id: notification.id,
              content: notification.content,
              senderId: parseInt(notification.senderId.toString()),
              recipientId: parseInt(notification.receiverId.toString()),
              timestamp: new Date(),
              messageType: 'TEXT'
            };

            console.log('💬 Converted to ChatMessage:', chatMessage);
            console.log('💬 Adding message to stream. Current messages count:', this.messages.value.length);

            // Отправляем новое сообщение через отдельный Observable
            this.newMessage.next(chatMessage);

            // Также добавляем в общий поток для обратной совместимости
            this.addMessage(chatMessage);
          } catch (error) {
            console.error('❌ Error parsing message:', error);
            console.error('❌ Message body was:', message.body);
          }
        });

        console.log('✅ Successfully subscribed to messages for user:', userId, 'on', subscriptionDestination);
      }, (error: any) => {
        console.error('❌ WebSocket connection error:', error);
        console.error('❌ Error details:', JSON.stringify(error));
        this.connected.next(false);

        // Пытаемся переподключиться через 3 секунды
        setTimeout(() => {
          console.log('🔄 Attempting to reconnect WebSocket...');
          this.connect(userId);
        }, 3000);
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

  getNewMessage(): Observable<ChatMessage | null> {
    return this.newMessage.asObservable();
  }

  setMessages(messages: ChatMessage[]): void {
    this.messages.next(messages);
  }

  private addMessage(message: ChatMessage): void {
    const currentMessages = this.messages.value;

    // Проверяем, что сообщение не дублируется
    const messageExists = currentMessages.some(m =>
      m.id && message.id && m.id === message.id
    );

    if (messageExists) {
      console.log('⚠️ Message already exists, skipping:', message.id);
      return;
    }

    const updatedMessages = [...currentMessages, message];

    // Сортируем сообщения по времени (старые сверху, новые снизу)
    const sortedMessages = updatedMessages.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateA - dateB; // Старые сообщения сверху, новые снизу
    });

    this.messages.next(sortedMessages);
    console.log('✅ New message added to stream, total messages:', sortedMessages.length);
  }
}
