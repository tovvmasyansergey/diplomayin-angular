import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatMessage } from '../models/chat-message.model';
import { WebSocketService } from '../service/websocket.service';
import { ChatService, PaginatedResponse } from '../service/chat.service';
import { UserService } from '../service/user.service';
import { AuthService } from '../service/auth.service';

const BACKEND_BASE_URL = 'http://localhost:7404';

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

  // Новые свойства для пагинации
  isLoadingMessages: boolean = false;
  hasMoreMessages: boolean = true;
  currentPage: number = 0;
  pageSize: number = 15;
  totalMessages: number = 0;

  // Кэш последних сообщений для каждого пользователя
  lastMessagesCache: Map<string, ChatMessage> = new Map();

  // Мобильная адаптивность
  showChatOnMobile: boolean = false;
  isMobile: boolean = false;

  // Автоматическая загрузка при скролле
  private scrollThreshold: number = 100; // пикселей от верха для загрузки

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

    // Определяем мобильное устройство
    this.isMobile = window.innerWidth <= 768;
    this.showChatOnMobile = false;

    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) {
        this.showChatOnMobile = false;
      }
    });

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
        console.log('📨 WebSocket messages received:', messages.length);
        console.log('📨 Current selected user ID:', this.selectedUserId);
        console.log('📨 Current user ID:', this.currentUser?.id);

        // Проверяем, что это сообщения для текущего выбранного пользователя
        if (this.selectedUserId && messages.length > 0) {
          // Фильтруем сообщения только для текущего диалога
          const currentDialogMessages = messages.filter(msg => {
            const senderMatch = msg.senderId.toString() === this.currentUser.id.toString() && msg.recipientId.toString() === this.selectedUserId;
            const recipientMatch = msg.senderId.toString() === this.selectedUserId && msg.recipientId.toString() === this.currentUser.id.toString();
            return senderMatch || recipientMatch;
          });

          console.log('📨 Filtered messages for current dialog:', currentDialogMessages.length);
          console.log('📨 All messages:', messages);
          console.log('📨 Filtered messages:', currentDialogMessages);

          if (currentDialogMessages.length > 0) {
            this.messages = currentDialogMessages;
            this.saveMessages();

            // Прокручиваем к последнему сообщению
            this.scrollToBottom();
          }
        }
      })
    );

    // Сохраненные сообщения будут загружены при выборе пользователя
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.webSocketService.disconnect();

    // Удаляем обработчик изменения размера окна
    window.removeEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) {
        this.showChatOnMobile = false;
      }
    });
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

    // На мобильных устройствах показываем чат
    if (this.isMobile) {
      this.showChatOnMobile = true;
    }

    // Загружаем историю чата
    this.fetchAndDisplayUserChat();
  }

  displayMessage(senderId: number, content: string): void {
    const message: ChatMessage = {
      content: content,
      senderId: senderId,
      recipientId: parseInt(this.selectedUserId || '0'),
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

    // Добавляем новое сообщение в конец списка
    this.messages = [...this.messages, message];

    // Сортируем все сообщения по времени для корректного отображения (старые сверху, новые снизу)
    this.messages = this.messages.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateA - dateB; // Старые сообщения сверху, новые снизу
    });

    console.log('📤 Total messages after adding:', this.messages.length);
  }

  async fetchAndDisplayUserChat(): Promise<void> {
    if (!this.selectedUserId) return;

    // Проверяем, что currentUser определен
    if (!this.currentUser || !this.currentUser.id) {
      console.error('❌ Current user is not defined, cannot load chat history');
      return;
    }

    // Сбрасываем пагинацию при выборе нового пользователя
    this.currentPage = 0;
    this.hasMoreMessages = true;
    this.isLoadingMessages = true;

    // Сначала пытаемся загрузить сохраненные сообщения
    this.loadSavedMessages();

    try {
      console.log('📋 Loading chat history between:', this.currentUser.id, 'and', this.selectedUserId);
      this.chatService.findChatMessagesWithPagination(this.currentUser.id.toString(), this.selectedUserId, this.currentPage, this.pageSize).subscribe({
        next: (response: PaginatedResponse<ChatMessage>) => {
          console.log('📋 Loaded chat history:', response);
          console.log('📋 Current user ID:', this.currentUser.id);
          console.log('📋 Current user email:', this.currentUser.email);
          console.log('📋 Selected user ID:', this.selectedUserId);
          console.log('📋 Total messages loaded:', response.content.length);
          console.log('📋 Total pages:', response.totalPages);
          console.log('📋 Current page:', response.number);

          // Обновляем кэш последних сообщений
          this.updateLastMessagesCache(response.content);

          // Сохраняем информацию о пагинации
          this.hasMoreMessages = !response.last;
          this.totalMessages = response.totalElements;

          // Сортируем сообщения по времени (старые сверху, новые снизу)
          const sortedMessages = response.content.sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return dateA - dateB; // Старые сообщения сверху, новые снизу
          });

          this.messages = sortedMessages;
          this.webSocketService.setMessages(sortedMessages);
          this.isLoadingMessages = false;

          console.log('📋 Messages assigned to this.messages:', this.messages.length);
          console.log('📋 First few messages in this.messages:', this.messages.slice(0, 3));

          // Прокручиваем вниз к последнему сообщению
          this.scrollToBottom();
        },
        error: (error) => {
          console.error('❌ Error loading chat history:', error);
          // Если API не работает, создаем пустую историю
          this.messages = [];
          this.webSocketService.setMessages([]);
          this.isLoadingMessages = false;
        }
      });
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
      this.isLoadingMessages = false;
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
      senderId: this.currentUser.id,
      recipientId: parseInt(this.selectedUserId),
      content: messageContent,
      timestamp: new Date(),
      messageType: 'TEXT'
    };

    console.log('📤 Sending message:', chatMessage);
    this.webSocketService.sendMessage(chatMessage);

    // Добавляем сообщение локально для мгновенного отображения
    this.displayMessage(this.currentUser.id, messageContent);
    this.newMessage = '';

    // Прокручиваем вниз к новому сообщению
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }

  private saveMessages(): void {
    if (this.selectedUserId) {
      const key = `chat_${this.currentUser.id}_${this.selectedUserId}`;
      localStorage.setItem(key, JSON.stringify(this.messages));
    }
  }

  private loadSavedMessages(): void {
    if (this.selectedUserId && this.currentUser) {
      const key = `chat_${this.currentUser.id}_${this.selectedUserId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const savedMessages = JSON.parse(saved);

          // Сортируем сохраненные сообщения по времени (старые сверху, новые снизу)
          const sortedMessages = savedMessages.sort((a: ChatMessage, b: ChatMessage) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return dateA - dateB; // Старые сообщения сверху, новые снизу
          });

          this.messages = sortedMessages;
          this.webSocketService.setMessages(sortedMessages);
          console.log('💾 Loaded saved messages:', sortedMessages.length);

          // Прокручиваем к последнему сообщению
          this.scrollToBottom();
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

    // Приводим оба значения к числам для корректного сравнения
    const messageSenderId = Number(message.senderId);
    const currentUserId = Number(this.currentUser.id);
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

  /**
   * Получить выбранного пользователя
   */
  getSelectedUser(): any {
    return this.allUsers.find(user => user.id.toString() === this.selectedUserId);
  }

  /**
   * Получить последнее сообщение для пользователя
   */
  getLastMessage(userId: string | number): ChatMessage | null {
    return this.lastMessagesCache.get(userId.toString()) || null;
  }

  /**
   * Обновить кэш последних сообщений
   */
  private updateLastMessagesCache(messages: ChatMessage[]): void {
    if (!this.selectedUserId || !this.currentUser) return;

    // Находим самое последнее сообщение по времени
    const sortedMessages = messages.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA; // DESC - самое новое первым (для поиска последнего сообщения)
    });

    const lastMessage = sortedMessages[0];
    if (lastMessage) {
      // Сохраняем последнее сообщение для текущего диалога
      const cacheKey = `${this.currentUser.id}_${this.selectedUserId}`;
      this.lastMessagesCache.set(cacheKey, lastMessage);
    }
  }

  /**
   * Загрузить больше сообщений (пагинация)
   */
  loadMoreMessages(): void {
    if (this.isLoadingMessages || !this.hasMoreMessages || !this.selectedUserId) {
      return;
    }

    this.isLoadingMessages = true;
    this.currentPage++;

    console.log('📄 Loading more messages, page:', this.currentPage);

    this.chatService.findChatMessagesWithPagination(this.currentUser.id.toString(), this.selectedUserId, this.currentPage, this.pageSize).subscribe({
      next: (response: PaginatedResponse<ChatMessage>) => {
        console.log('📄 Loaded more messages:', response.content.length);

        // Сортируем новые сообщения по времени (старые сверху, новые снизу)
        const sortedNewMessages = response.content.sort((a, b) => {
          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          return dateA - dateB; // Старые сообщения сверху, новые снизу
        });

        // Добавляем новые сообщения в начало списка
        this.messages = [...sortedNewMessages, ...this.messages];

        // Обновляем информацию о пагинации
        this.hasMoreMessages = !response.last;
        this.totalMessages = response.totalElements;

        this.isLoadingMessages = false;

        // Сохраняем позицию скролла
        this.maintainScrollPosition();
      },
      error: (error) => {
        console.error('❌ Error loading more messages:', error);
        this.isLoadingMessages = false;
        this.currentPage--; // Откатываем номер страницы при ошибке
      }
    });
  }

  /**
   * Сохранить позицию скролла при загрузке предыдущих сообщений
   */
  private maintainScrollPosition(): void {
    setTimeout(() => {
      const chatMessages = document.getElementById('chat-messages');
      if (chatMessages) {
        // Сохраняем текущую позицию скролла
        const currentScrollTop = chatMessages.scrollTop;
        const currentScrollHeight = chatMessages.scrollHeight;

        // После добавления новых сообщений восстанавливаем позицию
        chatMessages.scrollTop = currentScrollTop + (chatMessages.scrollHeight - currentScrollHeight);
      }
    }, 100);
  }

  /**
   * Улучшенный метод прокрутки к низу
   */
  scrollToBottom(): void {
    setTimeout(() => {
      const chatMessages = document.getElementById('chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
        console.log('📜 Scrolled to bottom, scrollTop:', chatMessages.scrollTop, 'scrollHeight:', chatMessages.scrollHeight);
      }
    }, 200); // Увеличиваем задержку для более надежной работы
  }

  /**
   * Обработка скролла для автоматической загрузки сообщений
   */
  onScroll(event: Event): void {
    const element = event.target as HTMLElement;

    // Проверяем, если пользователь прокрутил близко к верху
    if (element.scrollTop <= this.scrollThreshold && this.hasMoreMessages && !this.isLoadingMessages) {
      console.log('📄 Auto-loading more messages on scroll');
      this.loadMoreMessages();
    }
  }

  /**
   * Форматировать содержимое сообщения для правильного отображения
   */
  formatMessageContent(content: string): string {
    if (!content) return '';

    // Экранируем HTML теги для безопасности
    const escapedContent = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    // Заменяем переносы строк на <br>
    return escapedContent.replace(/\n/g, '<br>');
  }

  /**
   * Получить полный URL для изображения
   */
  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return '';

    // Если это уже полный URL, возвращаем как есть
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Убираем ведущий слеш, если он есть
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

    // Добавляем базовый URL бэкенда
    return `${BACKEND_BASE_URL}/${cleanPath}`;
  }

  /**
   * Обработка ошибки загрузки изображения
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.log('❌ Image load error for:', img.src);

    // Скрываем изображение
    img.style.display = 'none';

    // Находим родительский элемент и показываем span с буквой
    const avatar = img.parentElement;
    if (avatar) {
      const span = avatar.querySelector('span');
      if (span) {
        span.style.display = 'flex';
        console.log('✅ Fallback to letter avatar');
      }
    }
  }

  /**
   * Показать список пользователей (для мобильной версии)
   */
  showUsersList(): void {
    console.log('🔙 Back button clicked, showChatOnMobile was:', this.showChatOnMobile);
    this.showChatOnMobile = false;
    console.log('🔙 showChatOnMobile set to:', this.showChatOnMobile);

    // Очищаем выбранного пользователя для полного сброса
    this.selectedUserId = null;
    this.selectedUserName = '';
    this.messages = [];

    // Скрываем форму сообщений
    const messageForm = document.querySelector('#messageForm') as HTMLElement;
    if (messageForm) {
      messageForm.classList.add('hidden');
    }

    // Убираем активный класс со всех элементов пользователей
    document.querySelectorAll('.user-item').forEach(item => {
      item.classList.remove('active');
    });
  }

  /**
   * Автоматическое изменение размера textarea
   */
  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 50) + 'px';
  }

  /**
   * Обработка нажатий клавиш в textarea
   */
  onKeyDown(event: KeyboardEvent): void {
    // Отправка сообщения по Ctrl+Enter или Cmd+Enter
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
    }
    // Обычный Enter создает новую строку
    else if (event.key === 'Enter' && !event.shiftKey) {
      // Позволяем браузеру обработать Enter для создания новой строки
    }
  }
}
