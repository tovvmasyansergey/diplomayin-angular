import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessage } from '../models/chat-message.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:7404';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Получить сообщения между двумя пользователями (точно как в bank)
   */
  findChatMessages(senderId: string, recipientId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/messages/${senderId}/${recipientId}`, {
      headers: this.getHeaders()
    });
  }

  private getHeaders() {
    const token = this.authService.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
}



