import { ChatMessage } from './chat-message.model';

export interface ChatRoom {
  id?: number;
  roomName: string;
  user1Id: number;
  user1Name: string;
  user1Email: string;
  user2Id: number;
  user2Name: string;
  user2Email: string;
  isActive?: boolean;
  createdAt?: Date;
  messages?: ChatMessage[];
  unreadCount?: number;
  lastMessage?: ChatMessage;
}
