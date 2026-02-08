import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../service/auth.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent implements OnInit, OnDestroy {
  wifiUrl: string = 'http://192.168.0.208:4200';
  qrCodeImageUrl: string = '';

  isLoggedIn: boolean = false;
  currentUser: any = null;

  private routerSub?: Subscription;

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    // Генерируем QR-код для Wi-Fi доступа
    this.generateQRCode();
    // Cache auth state once on init
    this.updateAuthState();
    // Update auth state on navigation changes
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateAuthState());
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private updateAuthState(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUser = this.authService.getCurrentUser();
  }

  generateQRCode(): void {
    // Используем внешний API для генерации QR-кода
    this.qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(this.wifiUrl)}`;
  }

  refreshQRCode(): void {
    this.generateQRCode();
  }

  onQrCodeError(event: any): void {
    console.error('QR Code image failed to load, trying alternative source:', event);
    // Попробуем альтернативный способ
    this.qrCodeImageUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(this.wifiUrl)}`;
  }

  onQrCodeLoad(): void {
    console.log('QR Code image loaded successfully');
  }

  logout(): void {
    this.authService.logout();
    this.updateAuthState();
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
    if (this.isLoggedIn) {
      this.router.navigate(['/application']);
    } else {
      this.router.navigate(['/login']);
    }
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