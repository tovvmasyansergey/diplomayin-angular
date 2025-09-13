import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthResponseModel} from '../models/user-model/auth-response.model';
import {LoginCredentialsModel} from '../models/user-model/login-credentials.model';
import {EmployeeVerifyModel} from '../models/user-model/employee-verify.model';
import {EmailRequestModel} from '../models/user-model/email-request.model';
import {EmployeeForgotPasswordResponseModel} from '../models/user-model/employee-forgot-password-response.model';
import {EmployeeResponseModel} from '../models/user-model/employee-response.model';
import {RegisterRequestModel} from '../models/user-model/register-request.model';
import {API_CONSTANTS} from '../../../../diplomayin-angular/src/app/constants/api.constants';

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

  register(registerDto: RegisterRequestModel): Observable<any> {
    const path = `${this.BASE_PATH}auth/register`;
    return this.http.post<any>(path, registerDto);
  }

  auth(credentialsDto: LoginCredentialsModel): Observable<AuthResponseModel> {
    const path = `${this.BASE_PATH}auth/login`;
    return this.http.post<AuthResponseModel>(path, credentialsDto);
  }

  verify(verifyDto: EmployeeVerifyModel): Observable<AuthResponseModel> {
    const path = `${this.BASE_PATH}auth/verify-email`;
    return this.http.post<AuthResponseModel>(path, verifyDto);
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

  saveToken(employee: AuthResponseModel): void {
    if (employee.token != null) {
      localStorage.setItem('token', employee.token);
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

  getCurrentUser(): AuthResponseModel | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!(this.getToken());
  }

  updateCurrentUserProfilePicture(pic: string) {
    const currentUser: AuthResponseModel | null = this.getCurrentUser();
    if (currentUser) {
      // Добавляем поле profilePicture если нужно
      (currentUser as any).profilePicture = pic;
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }

  setCurrentUser(currentUser: AuthResponseModel): void {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }

}
