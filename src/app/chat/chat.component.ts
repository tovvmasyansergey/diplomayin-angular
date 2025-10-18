import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatMessage } from '../models/chat-message.model';
import { WebSocketService } from '../service/websocket.service';
import { ChatService } from '../service/chat.service';
import { UserService } from '../service/user.service';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class ChatComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  allUsers: any[] = [];
  selectedUserId: string | null = null;
  selectedUserName: string = '';
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isConnected: boolean = false;
  subscriptions: Subscription[] = [];
  nickname: string = '';
  selectedUser: string = '';

  constructor(
    private router: Router,
    private webSocketService: WebSocketService,
    private chatService: ChatService,
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('🔍 Current user in ngOnInit:', this.currentUser);
    console.log('🔍 Current user ID:', this.currentUser?.id);
    console.log('🔍 Current user email:', this.currentUser?.email);

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.nickname = this.currentUser.email;
    console.log('👤 Current user:', this.currentUser);

    // Подключаемся к WebSocket с ID пользователя
    this.webSocketService.connect(this.currentUser.id);

    // Подписка на статус подключения
    this.subscriptions.push(
      this.webSocketService.getConnected().subscribe(connected => {
        this.isConnected = connected;
        console.log('🔌 WebSocket connected:', connected);
        if (connected) {
          this.findAndDisplayConnectedUsers();
        }
      })
    );

    // Подписка на сообщения
    this.subscriptions.push(
      this.webSocketService.getMessages().subscribe(messages => {
        this.messages = messages;
        this.saveMessages();
        this.scroll
        ToBottom();
      })
    );

    // Сохраненные сообщения будут загружены при выборе пользователя
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.webSocketService.disconnect();
  }

  async findAndDisplayConnectedUsers(): Promise<void> {
    try {
      // Используем существующий сервис для получения пользователей
      this.userService.getAllUsers().subscribe({
        next: (users) => {
          console.log('👥 Loaded users:', users);
          // Исключаем текущего пользователя
          this.allUsers = users.filter(user => user.email !== this.nickname);
          console.log('👥 Filtered users for chat:', this.allUsers);
        },
        error: (error) => {
          console.error('❌ Error loading connected users:', error);
          // Если API не работает, используем мок данные для тестирования
          this.allUsers = [
            { id: 2, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
            { id: 3, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' }
          ];
          console.log('👥 Using mock users for testing:', this.allUsers);
        }
      });
    } catch (error) {
      console.error('❌ Error loading connected users:', error);
    }
  }

  eventListenerChatOpen(): void {
    const messageForm = document.querySelector('#messageForm') as HTMLElement;
    if (messageForm) {
      messageForm.classList.remove('hidden');
    }
    this.fetchAndDisplayUserChat();
  }

  userItemClick(user: any): void {
    console.log('👤 User clicked:', user);

    // Проверяем, что currentUser определен
    if (!this.currentUser || !this.currentUser.id) {
      console.error('❌ Current user is not defined, cannot select user');
      return;
    }

    // Убираем активный класс со всех элементов
    document.querySelectorAll('.user-item').forEach(item => {
      item.classList.remove('active');
    });

    // Показываем форму сообщений
    const messageForm = document.querySelector('#messageForm') as HTMLElement;
    if (messageForm) {
      messageForm.classList.remove('hidden');
    }

    // Устанавливаем выбранного пользователя
    this.selectedUserId = user.id.toString();
    this.selectedUserName = `${user.firstName} ${user.lastName}`;

    console.log('👤 Selected user ID:', this.selectedUserId);
    console.log('👤 Current user ID:', this.currentUser.id);

    // Добавляем активный класс к выбранному элементу
    const clickedElement = document.getElementById(user.id.toString());
    if (clickedElement) {
      clickedElement.classList.add('active');
    }

    // Загружаем историю чата
    this.fetchAndDisplayUserChat();
  }

  displayMessage(senderId: string, content: string): void {
    const message: ChatMessage = {
      content: content,
      senderId: senderId,
      recipientId: this.selectedUserId || '',
      timestamp: new Date(),
      messageType: 'TEXT'
    };

    console.log('📤 Displaying message:', {
      senderId: senderId,
      recipientId: this.selectedUserId,
      content: content,
      currentUserId: this.currentUser.id,
      isFromCurrentUser: this.isMessageFromCurrentUser(message)
    });

    const currentMessages = this.messages;
    this.messages = [...currentMessages, message];

    console.log('📤 Total messages after adding:', this.messages.length);
  }

  async fetchAndDisplayUserChat(): Promise<void> {
    if (!this.selectedUserId) return;

    // Проверяем, что currentUser определен
    if (!this.currentUser || !this.currentUser.id) {
      console.error('❌ Current user is not defined, cannot load chat history');
      return;
    }

    try {
      console.log('📋 Loading chat history between:', this.currentUser.id, 'and', this.selectedUserId);
      this.chatService.findChatMessages(this.currentUser.id.toString(), this.selectedUserId).subscribe({
        next: (userChat) => {
          console.log('📋 Loaded chat history:', userChat);
          console.log('📋 Current user ID:', this.currentUser.id);
          console.log('📋 Current user email:', this.currentUser.email);
          console.log('📋 Selected user ID:', this.selectedUserId);
          console.log('📋 Total messages loaded:', userChat.length);

          // Логируем каждое сообщение для диагностики
          userChat.forEach((message, index) => {
            const isFromCurrentUser = this.isMessageFromCurrentUser(message);
            console.log(`📋 Message ${index}:`, {
              senderId: message.senderId,
              recipientId: message.recipientId,
              content: message.content,
              isFromCurrentUser: isFromCurrentUser,
              shouldBeOnRight: isFromCurrentUser,
              shouldBeOnLeft: !isFromCurrentUser,
              currentUserId: this.currentUser.id,
              currentUserEmail: this.currentUser.email
            });
          });

          this.messages = userChat;
          this.webSocketService.setMessages(userChat);

          console.log('📋 Messages assigned to this.messages:', this.messages.length);
          console.log('📋 First few messages in this.messages:', this.messages.slice(0, 3));

          // Прокручиваем вниз
          setTimeout(() => {
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
              chatMessages.scrollTop = chatMessages.scrollHeight;
            }
          }, 100);
        },
        error: (error) => {
          console.error('❌ Error loading chat history:', error);
          // Если API не работает, создаем пустую историю
          this.messages = [];
          this.webSocketService.setMessages([]);
        }
      });
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
    }
  }

  sendMessage(event?: Event): void {
    // Предотвращаем отправку по умолчанию
    if (event) {
      event.preventDefault();
    }

    const messageContent = this.newMessage?.trim();

    // Строгая валидация
    if (!messageContent || messageContent.length === 0) {
      console.log('❌ Cannot send empty message');
      return;
    }

    if (!this.selectedUserId || this.selectedUserId === 'null') {
      console.log('❌ No user selected for chat');
      return;
    }

    if (!this.currentUser?.id) {
      console.log('❌ No current user');
      return;
    }

    const chatMessage: ChatMessage = {
      senderId: this.currentUser.id.toString(),
      recipientId: this.selectedUserId,
      content: messageContent,
      timestamp: new Date(),
      messageType: 'TEXT'
    };

    console.log('📤 Sending message:', chatMessage);
    this.webSocketService.sendMessage(chatMessage);
    this.displayMessage(this.currentUser.id.toString(), messageContent);
    this.newMessage = '';

    // Прокручиваем вниз
    setTimeout(() => {
      const chatMessages = document.getElementById('chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }

  private saveMessages(): void {
    if (this.selectedUserId) {
      const key = `chat_${this.currentUser.id}_${this.selectedUserId}`;
      localStorage.setItem(key, JSON.stringify(this.messages));
    }
  }

  private loadSavedMessages(): void {
    if (this.selectedUserId) {
      const key = `chat_${this.currentUser.id}_${this.selectedUserId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          this.messages = JSON.parse(saved);
          this.webSocketService.setMessages(this.messages);
          console.log('💾 Loaded saved messages:', this.messages);
        } catch (error) {
          console.error('❌ Error loading saved messages:', error);
        }
      }
    }
  }

  /**
   * Проверить, является ли сообщение от текущего пользователя
   */
  isMessageFromCurrentUser(message: ChatMessage): boolean {
    // Проверяем, что currentUser существует
    if (!this.currentUser || !this.currentUser.id) {
      console.error('❌ Current user is not defined or has no ID');
      return false;
    }

    // Приводим оба значения к строкам для корректного сравнения
    const messageSenderId = String(message.senderId);
    const currentUserId = String(this.currentUser.id);
    const isFromCurrentUser = messageSenderId === currentUserId;

    console.log('🔍 Message check:', {
      messageSenderId: messageSenderId,
      currentUserId: currentUserId,
      isFromCurrentUser: isFromCurrentUser,
      message: message.content,
      originalSenderId: message.senderId,
      originalCurrentUserId: this.currentUser.id,
      currentUserEmail: this.currentUser.email,
      senderIdType: typeof message.senderId,
      currentUserIdType: typeof this.currentUser.id,
      comparison: `${messageSenderId} === ${currentUserId} = ${isFromCurrentUser}`
    });
    return isFromCurrentUser;
  }

  /**
   * Форматировать время сообщения
   */
  formatMessageTime(date: Date | string): string {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString('ru-RU');
    }
  }

  /**
   * Прокрутить чат вниз
   */
  scrollToBottom(): void {
    setTimeout(() => {
      const chatMessages = document.getElementById('chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }

  /**
   * Навигация
   */
  navigateToHome(): void {
    this.router.navigate(['/welcome']);
  }

  navigateToUsers(): void {
    this.router.navigate(['/all-users']);
  }

  // Свойства для шаблона
  get messageForm(): HTMLElement {
    return document.querySelector('#messageForm') as HTMLElement;
  }
}
