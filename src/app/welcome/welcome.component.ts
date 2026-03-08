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

  private readonly ellipseInfoTexts: Record<'hy' | 'ru' | 'en', string> = {
    hy: 'Սահմանում։ Էլիպս է կոչվում հարթության այն կետերի երկրաչափական տեղը, որոնց հեռավորությունների գումարը տրված երկու F1 և F2 կետերից հաստատուն է և մեծ է F1F2 հատվածի երկարությունից։ Էլիպսի հատկությունները՝ Համաչափություն. Եթե (x; y) կետը պատկանում է էլիպսին, ապա (x; -y), (-x; y) և (-x; -y) կետերը ևս պատկանում են էլիպսին։ Այսինքն՝ էլիպսը համաչափ է OX և OY առանցքների, ինչպես նաև O սկզբնակետի նկատմամբ։ Սահմանափակություն. Հավասարումից հետևում է, որ |x|<=a, |y|<=b։ Ուստի էլիպսը սահմանափակ կոր է և գտնվում է -a<=x<=a, -b<=y<=b ուղղանկյան ներսում։ Այն կոչվում է էլիպսի հիմնական ուղղանկյուն։',
    ru: 'Определение. Эллипс - это геометрическое место точек плоскости, для которых сумма расстояний до двух фиксированных точек F1 и F2 постоянна и больше длины отрезка F1F2. Свойства эллипса: Симметрия. Если точка (x; y) принадлежит эллипсу, то точки (x; -y), (-x; y) и (-x; -y) также принадлежат ему. Значит, эллипс симметричен относительно осей OX и OY, а также относительно начала координат O. Ограниченность. Из уравнения следует, что |x|<=a, |y|<=b. Поэтому эллипс является ограниченной кривой и расположен внутри прямоугольника -a<=x<=a, -b<=y<=b. Этот прямоугольник называется основным прямоугольником эллипса.',
    en: 'Definition. An ellipse is the locus of points in a plane for which the sum of distances to two fixed points F1 and F2 is constant and greater than the length of segment F1F2. Ellipse properties: Symmetry. If point (x, y) belongs to the ellipse, then (x, -y), (-x, y), and (-x, -y) also belong to it. Therefore, the ellipse is symmetric with respect to the OX and OY axes and also with respect to the origin O. Boundedness. From the equation it follows that |x|<=a, |y|<=b. Hence, the ellipse is a bounded curve located inside the rectangle -a<=x<=a, -b<=y<=b. This rectangle is called the principal rectangle of the ellipse.'
  };

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

  get ellipseInfoCards(): { code: 'HY' | 'RU' | 'EN'; text: string }[] {
    return [
      { code: 'HY', text: this.ellipseInfoTexts.hy },
      { code: 'RU', text: this.ellipseInfoTexts.ru },
      { code: 'EN', text: this.ellipseInfoTexts.en }
    ];
  }

}