import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatMessage } from '../models/chat-message.model';
import { WebSocketService } from '../service/websocket.service';
import { ChatService, PaginatedResponse } from '../service/chat.service';
import { UserService } from '../service/user.service';
import { AuthService } from '../service/auth.service';

// Функция для определения URL бэкенда
function getBackendBaseUrl(): string {
  const hostname = window.location.hostname;
  return (hostname === 'localhost' || hostname === '127.0.0.1') 
    ? 'http://localhost:7404' 
    : `http://${hostname}:7404`;
}

const BACKEND_BASE_URL = getBackendBaseUrl();

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
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
      // На мобильных устройствах корректируем высоту при открытии/закрытии клавиатуры
      if (this.isMobile) {
        this.adjustViewportForKeyboard();
      }
    });

    // Обработка изменения размера viewport (для мобильных устройств)
    if (this.isMobile) {
      window.visualViewport?.addEventListener('resize', () => {
        this.adjustViewportForKeyboard();
      });
    }

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

    // Подписка на новые сообщения через WebSocket
    this.subscriptions.push(
      this.webSocketService.getNewMessage().subscribe(newMessage => {
        if (!newMessage) {
          return;
        }

        console.log('📨 New WebSocket message received:', newMessage);
        console.log('📨 Current selected user ID:', this.selectedUserId);
        console.log('📨 Current user ID:', this.currentUser?.id);
        console.log('📨 Message senderId:', newMessage.senderId);
        console.log('📨 Message recipientId:', newMessage.recipientId);

        // Проверяем, является ли текущий пользователь получателем сообщения
        // (отправитель не должен получать свое сообщение обратно через WebSocket)
        const isRecipient = newMessage.recipientId.toString() === this.currentUser.id.toString();

        if (!isRecipient) {
          console.log('⚠️ Message not for current user as recipient, skipping');
          return;
        }

        // Определяем ID собеседника (отправителя, так как текущий пользователь - получатель)
        const otherUserId = newMessage.senderId.toString();

        // Если выбран диалог с этим пользователем, добавляем сообщение в список
        if (this.selectedUserId === otherUserId) {
          // Проверяем, есть ли это сообщение уже в списке
          const messageExists = this.messages.some(m =>
            m.id && newMessage.id && m.id === newMessage.id
          );

          if (messageExists) {
            console.log('⚠️ Message already exists, skipping:', newMessage.id);
            return;
          }

          console.log('➕ Adding new message to current dialog:', newMessage.content);

          // Добавляем новое сообщение
          this.messages = [...this.messages, newMessage];

          // Сортируем сообщения по времени
          this.messages = this.messages.sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return dateA - dateB;
          });

          this.saveMessages();

          // Прокручиваем к последнему сообщению
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        } else {
          // Сообщение от другого пользователя - сохраняем его для будущего отображения
          console.log('💾 Saving message for future display from user:', otherUserId);
          this.saveMessageForUser(otherUserId, newMessage);
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

    // Загружаем сохраненные сообщения (включая новые из WebSocket) без прокрутки
    const savedMessages = this.loadSavedMessagesSync();

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

          // Сортируем сообщения из API по времени (старые сверху, новые снизу)
          const sortedApiMessages = response.content.sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return dateA - dateB; // Старые сообщения сверху, новые снизу
          });

          // Объединяем сообщения из API с сохраненными сообщениями (из WebSocket)
          const allMessagesMap = new Map<number | string, ChatMessage>();

          // Сначала добавляем сообщения из API
          sortedApiMessages.forEach(msg => {
            if (msg.id) {
              allMessagesMap.set(msg.id, msg);
            }
          });

          // Затем добавляем сохраненные сообщения (которые могут быть новее и еще не в API)
          savedMessages.forEach(msg => {
            if (msg.id) {
              // Если сообщение уже есть в API, используем версию из API (более актуальную)
              if (!allMessagesMap.has(msg.id)) {
                allMessagesMap.set(msg.id, msg);
              }
            } else {
              // Сообщения без ID (локальные) добавляем с уникальным ключом
              const uniqueKey = `local_${new Date(msg.timestamp).getTime()}_${Math.random()}`;
              allMessagesMap.set(uniqueKey, msg);
            }
          });

          // Преобразуем Map обратно в массив и сортируем по времени (старые сверху, новые снизу)
          const mergedMessages = Array.from(allMessagesMap.values()).sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return dateA - dateB; // Старые сообщения сверху, новые снизу
          });

          this.messages = mergedMessages;
          this.webSocketService.setMessages(mergedMessages);
          this.saveMessages(); // Сохраняем объединенные сообщения
          this.isLoadingMessages = false;

          console.log('📋 Messages assigned to this.messages:', this.messages.length);
          console.log('📋 First message timestamp:', this.messages[0]?.timestamp);
          console.log('📋 Last message timestamp:', this.messages[this.messages.length - 1]?.timestamp);

          // Прокручиваем вниз к последнему сообщению после обновления DOM
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        },
        error: (error) => {
          console.error('❌ Error loading chat history:', error);
          // Если API не работает, используем сохраненные сообщения
          this.messages = savedMessages;
          this.webSocketService.setMessages(savedMessages);
          this.isLoadingMessages = false;
          // Прокручиваем вниз
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        }
      });
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
      this.messages = savedMessages;
      this.webSocketService.setMessages(savedMessages);
      this.isLoadingMessages = false;
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
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

  private saveMessageForUser(userId: string, message: ChatMessage): void {
    if (!this.currentUser) return;

    const key = `chat_${this.currentUser.id}_${userId}`;
    const saved = localStorage.getItem(key);
    let savedMessages: ChatMessage[] = [];

    if (saved) {
      try {
        savedMessages = JSON.parse(saved);
      } catch (error) {
        console.error('❌ Error parsing saved messages:', error);
      }
    }

    // Проверяем, нет ли уже этого сообщения
    const messageExists = savedMessages.some(m =>
      m.id && message.id && m.id === message.id
    );

    if (!messageExists) {
      savedMessages.push(message);
      // Сортируем по времени
      savedMessages = savedMessages.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateA - dateB;
      });
      localStorage.setItem(key, JSON.stringify(savedMessages));
    }
  }

  private loadSavedMessages(): void {
    const messages = this.loadSavedMessagesSync();
    this.messages = messages;
    this.webSocketService.setMessages(messages);
    console.log('💾 Loaded saved messages:', messages.length);
    // Прокручиваем к последнему сообщению
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }

  private loadSavedMessagesSync(): ChatMessage[] {
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

          return sortedMessages;
        } catch (error) {
          console.error('❌ Error loading saved messages:', error);
          return [];
        }
      }
    }
    return [];
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
    this.router.navigate(['/']);
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
    // Используем несколько попыток для надежной прокрутки
    const attemptScroll = (attempts: number = 0) => {
      const chatMessages = document.getElementById('chat-messages');
      if (chatMessages) {
        const targetScroll = chatMessages.scrollHeight;
        chatMessages.scrollTop = targetScroll;
        
        // Проверяем, что прокрутка действительно произошла
        if (chatMessages.scrollTop < targetScroll - 10 && attempts < 5) {
          // Если прокрутка не произошла, пробуем еще раз
          setTimeout(() => attemptScroll(attempts + 1), 50);
        } else {
          console.log('📜 Scrolled to bottom, scrollTop:', chatMessages.scrollTop, 'scrollHeight:', chatMessages.scrollHeight);
        }
      } else if (attempts < 10) {
        // Если элемент еще не готов, пробуем еще раз
        setTimeout(() => attemptScroll(attempts + 1), 50);
      }
    };
    
    setTimeout(() => attemptScroll(), 100);
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

  /**
   * Обработка фокуса на поле ввода (для мобильных устройств)
   */
  onInputFocus(event: Event): void {
    // На мобильных устройствах прокручиваем к полю ввода при фокусе
    if (this.isMobile) {
      setTimeout(() => {
        const textarea = event.target as HTMLElement;
        if (textarea) {
          textarea.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
          // Дополнительно прокручиваем контейнер сообщений
          const messagesContainer = document.getElementById('chat-messages');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }
      }, 300); // Небольшая задержка для открытия клавиатуры
    }
  }

  /**
   * Обработка потери фокуса на поле ввода
   */
  onInputBlur(event: Event): void {
    // При потере фокуса можно выполнить дополнительные действия
  }

  /**
   * Корректировка viewport при открытии/закрытии клавиатуры на мобильных
   */
  adjustViewportForKeyboard(): void {
    if (!this.isMobile) return;

    const viewport = window.visualViewport;
    if (viewport) {
      const chatContainer = document.querySelector('.chat-container') as HTMLElement;
      const chatPanel = document.querySelector('.chat-panel') as HTMLElement;
      
      if (chatContainer && chatPanel) {
        // Устанавливаем высоту контейнера на основе видимого viewport
        const height = viewport.height;
        chatContainer.style.height = `${height}px`;
        chatPanel.style.height = `${height}px`;
        
        // Прокручиваем к последнему сообщению
        setTimeout(() => {
          const messagesContainer = document.getElementById('chat-messages');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }, 100);
      }
    }
  }
}
