import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {NgIf} from '@angular/common';
import {AuthService} from '../service/auth.service';
import {AUTH_MESSAGES} from '../constants/auth-messages.constant';
import {LoginCredentialsModel} from '../models/user-model/login-credentials.model';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [FormsModule, NgIf]
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  rememberMe: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onLogin() {
    // Валидация полей
    if (!this.username || !this.password) {
      this.errorMessage = AUTH_MESSAGES.ERROR.REQUIRED_FIELDS;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = new LoginCredentialsModel(this.username, this.password);

    this.authService.auth(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Сохраняем токен и данные пользователя

        // Перенаправляем на главную страницу
        this.router.navigate(['/']).then(() => {
          console.log(AUTH_MESSAGES.SUCCESS.LOGIN_SUCCESS);
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Ошибка входа:', error);

        // Обработка различных типов ошибок
        if (error.status === 401) {
          this.errorMessage = AUTH_MESSAGES.ERROR.INVALID_CREDENTIALS;
        } else if (error.status === 404) {
          this.errorMessage = AUTH_MESSAGES.ERROR.USER_NOT_FOUND;
        } else if (error.status === 403) {
          this.errorMessage = AUTH_MESSAGES.ERROR.ACCOUNT_BLOCKED;
        } else if (error.status === 0) {
          this.errorMessage = AUTH_MESSAGES.ERROR.CONNECTION_ERROR;
        } else if (error.status >= 500) {
          this.errorMessage = AUTH_MESSAGES.ERROR.SERVER_ERROR;
        } else {
          this.errorMessage = error.error?.message || AUTH_MESSAGES.ERROR.UNKNOWN_ERROR;
        }
      }
    });
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  navigateToEducation() {
    this.router.navigate(['/education']);
  }

  navigateToContact() {
    this.router.navigate(['/contact']);
  }

  navigateToAbout() {
    this.router.navigate(['/about']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
