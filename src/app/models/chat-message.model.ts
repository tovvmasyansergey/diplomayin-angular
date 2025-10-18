export interface ChatMessage {
  id?: number;
  content: string;
  senderId: string | number;
  recipientId: string | number;
  timestamp: Date;
  messageType: string;
}

export interface ChatNotification {
  id: number;
  senderId: string | number;
  receiverId: string | number;
  content: string;
}