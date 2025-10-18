import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {LoginRequestModel} from '../models/user-model/login.request.model';
import {LoginCredentialsModel} from '../models/user-model/login-credentials.model';
import {EmployeeVerifyModel} from '../models/user-model/employee-verify.model';
import {EmailRequestModel} from '../models/user-model/email-request.model';
import {EmployeeForgotPasswordResponseModel} from '../models/user-model/employee-forgot-password-response.model';
import {EmployeeResponseModel} from '../models/user-model/employee-response.model';
import {RegisterRequestModel} from '../models/user-model/register-request.model';
import {API_CONSTANTS} from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly BASE_PATH = API_CONSTANTS.BASE_PATH;

  constructor(
    private readonly http: HttpClient,
    private readonly route: Router,
  ) {
  }

  register(formData: FormData): Observable<string> {
    const path = `${this.BASE_PATH}auth/signup`;
    return this.http.post(path, formData, {responseType: 'text'});
  }

  getAllUsers(page: number = 0, size: number = 15): Observable<any> {
    const path = `${this.BASE_PATH}auth/users?page=${page}&size=${size}`;
    return this.http.get<any>(path);
  }

  editUser(userId: number, formData: FormData): Observable<string> {
    const path = `${this.BASE_PATH}auth/edit/${userId}`;
    return this.http.put(path, formData, {responseType: 'text'});
  }

  deleteUser(userId: number): Observable<string> {
    const path = `${this.BASE_PATH}auth/delete/${userId}`;
    return this.http.delete(path, {responseType: 'text'});
  }

  auth(credentialsDto: LoginCredentialsModel): Observable<LoginRequestModel> {
    const path = `${this.BASE_PATH}auth/login`;
    return this.http.post<LoginRequestModel>(path, credentialsDto);
  }

  verify(verifyDto: EmployeeVerifyModel): Observable<LoginRequestModel> {
    const path = `${this.BASE_PATH}auth/verify-email`;
    return this.http.post<LoginRequestModel>(path, verifyDto);
  }

  changePassword(verifyDto: EmployeeVerifyModel): Observable<void> {
    const path = `${this.BASE_PATH}auth/change-password`;
    return this.http.post<void>(path, verifyDto);
  }

  sendForgetPasswordVerifyCode(emailRequestModel: EmailRequestModel): Observable<void> {
    const path = `${this.BASE_PATH}auth/resend-code`;
    return this.http.post<void>(path, emailRequestModel);
  }

  checkVerifyCode(code: any): Observable<boolean> {
    const path = `${this.BASE_PATH}auth/check-code`;
    return this.http.post<boolean>(path, code);
  }

  setForgotPasswordToken(emailRequestModel: EmailRequestModel): Observable<EmployeeForgotPasswordResponseModel> {
    const path = `${this.BASE_PATH}auth/set-forgot-password-token`;
    return this.http.post<EmployeeForgotPasswordResponseModel>(path, emailRequestModel);
  }

  isVerifiedByEmail(requestDto: EmailRequestModel): Observable<boolean> {
    let path: string = `${this.BASE_PATH}auth/is-verified`;
    return this.http.post<boolean>(path, requestDto);
  }

  saveToken(employee: LoginRequestModel): void {
    console.log('=== SAVING TOKEN ===');
    console.log('Employee object:', employee);
    console.log('Token value:', employee.token);
    console.log('Token type:', typeof employee.token);
    console.log('===================');
    
    if (employee.token != null && employee.token.length > 0) {
      localStorage.setItem('token', employee.token);
      console.log('Token saved to localStorage');
    } else {
      console.error('Token is null or empty!');
    }
    
    localStorage.setItem('currentUser', JSON.stringify(employee));
    console.log('User data saved to localStorage');
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
    
    console.log('isLoggedIn check:', {
      hasToken: !!token,
      hasCurrentUser: !!currentUser,
      tokenLength: token ? token.length : 0
    });
    
    return !!(token && currentUser && token.length > 0);
  }

  updateCurrentUserProfilePicture(pic: string) {
    const currentUser: LoginRequestModel | null = this.getCurrentUser();
    if (currentUser) {
      // Добавляем поле profilePicture если нужно
      (currentUser as any).profilePicture = pic;
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }

  setCurrentUser(currentUser: LoginRequestModel): void {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }

}
