import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { API_CONSTANTS } from '../constants/api.constants';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location?: string;
  profilePicture?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly BASE_PATH = API_CONSTANTS.BASE_PATH;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    // Use pagination with large page size to get all users
    const path = `${this.BASE_PATH}api/users?page=0&size=1000`;
    return this.http.get<any>(path, {
      headers: this.getHeaders()
    }).pipe(
      map((response: any) => {
        // Extract content from paginated response
        return response.content || [];
      })
    );
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  getUserById(id: number): Observable<User> {
    // TODO: Replace with actual API call
    // const path = `${this.BASE_PATH}users/${id}`;
    // return this.http.get<User>(path);

    // Mock implementation
    const mockUser: User = {
      id: id,
      firstName: 'Mock',
      lastName: 'User',
      email: 'mock@example.com',
      phone: '+1234567890',
      location: 'Mock Location',
      role: 'Mock Role'
    };

    return of(mockUser).pipe(delay(500));
  }
}
