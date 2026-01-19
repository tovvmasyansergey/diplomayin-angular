import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {LoginRequestModel} from '../models/user-model/login.request.model';
import {LoginCredentialsModel} from '../models/user-model/login-credentials.model';
import {EmployeeVerifyModel} from '../models/user-model/employee-verify.model';
import {RegisterRequestModel} from '../models/user-model/register-request.model';
import {API_CONSTANTS} from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly BASE_PATH = API_CONSTANTS.BASE_PATH;
  private readonly HEARTBEAT_TIMEOUT = 3000;
  private readonly HEARTBEAT_INTERVAL = 1000;
  private readonly HEARTBEAT_KEY = 'app_heartbeat';

  constructor(
    private readonly http: HttpClient,
    private readonly route: Router,
  ) {
  }

  /**
   * Register a new user with optional profile picture
   * @param registerData - User registration data
   * @param profilePicture - Optional profile picture file
   */
  register(registerData: RegisterRequestModel, profilePicture?: File): Observable<string> {
    const path = `${this.BASE_PATH}auth/signup`;

    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(registerData)], {
      type: 'application/json'
    }));
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    return this.http.post(path, formData, {responseType: 'text'});
  }

  getAllUsers(page: number = 0, size: number = 15): Observable<any> {
    const path = `${this.BASE_PATH}api/users?page=${page}&size=${size}`;
    const token = this.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });

    return this.http.get<any>(path, { headers });
  }

  editUser(userId: number, registerData: RegisterRequestModel, profilePicture?: File): Observable<string> {
    const path = `${this.BASE_PATH}auth/edit/${userId}`;
    const token = this.getToken();
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(registerData)], {
      type: 'application/json'
    }));
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    const headers = new HttpHeaders({
      ...(token && { 'Authorization': `Bearer ${token}` })
    });

    return this.http.put(path, formData, {
      responseType: 'text',
      headers: headers
    });
  }

  deleteUser(userId: number): Observable<string> {
    const path = `${this.BASE_PATH}auth/delete/${userId}`;
    const token = this.getToken();
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return this.http.delete(path, {
      responseType: 'text',
      headers: headers
    });
  }

  auth(credentialsDto: LoginCredentialsModel): Observable<LoginRequestModel> {
    const path = `${this.BASE_PATH}auth/login`;
    return this.http.post<LoginRequestModel>(path, credentialsDto);
  }

  saveToken(employee: LoginRequestModel): void {
    if (employee.token != null && employee.token.length > 0) {
      localStorage.setItem('token', employee.token);
      console.log('Token saved to localStorage');
    } else {
      console.error('Token is null or empty!');
    }

    localStorage.setItem('currentUser', JSON.stringify(employee));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.route.navigate(['/']).then().catch();
  }

  getCurrentUser(): LoginRequestModel | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const currentUser = this.getCurrentUser();
    return !!(token && currentUser && token.length > 0);
  }

  initSession(): void {
    const now = Date.now();
    const lastHeartbeat = localStorage.getItem(this.HEARTBEAT_KEY);

    if (!lastHeartbeat || now - Number(lastHeartbeat) > this.HEARTBEAT_TIMEOUT) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      this.route.navigate(['login']);
    }

    setInterval(() => {
      localStorage.setItem(this.HEARTBEAT_KEY, String(Date.now()));
    }, this.HEARTBEAT_INTERVAL);
  }

}
