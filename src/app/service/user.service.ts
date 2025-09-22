import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { API_CONSTANTS } from '../constants/api.constants';

export interface User {
  id: number;
  firstname: string;
  lastname: string;
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
    // TODO: Replace with actual API call when backend is ready
    // const path = `${this.BASE_PATH}users/all`;
    // return this.http.get<User[]>(path);

    // Mock data for now
    const mockUsers: User[] = [
      {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        location: 'New York, USA',
        role: 'Developer'
      },
      {
        id: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567891',
        location: 'London, UK',
        role: 'Designer'
      },
      {
        id: 3,
        firstname: 'Mike',
        lastname: 'Johnson',
        email: 'mike.johnson@example.com',
        phone: '+1234567892',
        location: 'Tokyo, Japan',
        role: 'Manager'
      },
      {
        id: 4,
        firstname: 'Sarah',
        lastname: 'Wilson',
        email: 'sarah.wilson@example.com',
        phone: '+1234567893',
        location: 'Paris, France',
        role: 'Analyst'
      },
      {
        id: 5,
        firstname: 'David',
        lastname: 'Brown',
        email: 'david.brown@example.com',
        phone: '+1234567894',
        location: 'Sydney, Australia',
        role: 'Developer'
      },
      {
        id: 6,
        firstname: 'Lisa',
        lastname: 'Davis',
        email: 'lisa.davis@example.com',
        phone: '+1234567895',
        location: 'Berlin, Germany',
        role: 'Designer'
      }
    ];

    return of(mockUsers).pipe(delay(1000)); // Simulate API delay
  }

  getUserById(id: number): Observable<User> {
    // TODO: Replace with actual API call
    // const path = `${this.BASE_PATH}users/${id}`;
    // return this.http.get<User>(path);

    // Mock implementation
    const mockUser: User = {
      id: id,
      firstname: 'Mock',
      lastname: 'User',
      email: 'mock@example.com',
      phone: '+1234567890',
      location: 'Mock Location',
      role: 'Mock Role'
    };

    return of(mockUser).pipe(delay(500));
  }
}
