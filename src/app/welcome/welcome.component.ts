import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {
  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  get isLoggedIn(): boolean {
    const loggedIn = this.authService.isLoggedIn();
    console.log('WelcomeComponent isLoggedIn:', loggedIn);
    return loggedIn;
  }

  get currentUser(): any {
    const user = this.authService.getCurrentUser();
    console.log('WelcomeComponent currentUser:', user);
    return user;
  }

  logout(): void {
    this.authService.logout();
  }

  checkAuthStatus(): void {
    console.log('=== Проверка статуса авторизации ===');
    console.log('localStorage token:', localStorage.getItem('token'));
    console.log('localStorage currentUser:', localStorage.getItem('currentUser'));
    console.log('isLoggedIn():', this.authService.isLoggedIn());
    console.log('getCurrentUser():', this.authService.getCurrentUser());
    console.log('getToken():', this.authService.getToken());
    console.log('=====================================');
  }

  clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    console.log('Данные авторизации очищены');
    alert('Данные авторизации очищены. Перезагрузите страницу.');
  }

  navigateToApp() {
  }

  navigateToHome(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    console.log('Navigating to home...');
    this.router.navigate(['/']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister(event?: Event) {
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

  navigateToAllUsers() {
    this.router.navigate(['/all-users']);
  }
}