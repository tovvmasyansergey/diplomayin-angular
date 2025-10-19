import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessage } from '../models/chat-message.model';
import { AuthService } from './auth.service';

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

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
   * Получить сообщения между двумя пользователями с пагинацией
   */
  findChatMessagesWithPagination(senderId: string, recipientId: string, page: number = 0, size: number = 15): Observable<PaginatedResponse<ChatMessage>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PaginatedResponse<ChatMessage>>(`${this.apiUrl}/messages/${senderId}/${recipientId}/paginated`, {
      headers: this.getHeaders(),
      params: params
    });
  }

  /**
   * Получить сообщения между двумя пользователями (старый метод для обратной совместимости)
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



