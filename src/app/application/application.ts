import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../service/auth.service';
import {LoginRequestModel} from '../models/user-model/login.request.model';

@Component({
  selector: 'app-application',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './application.html',
  styleUrl: './application.css'
})
export class ApplicationComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  getCurrentUser(): any {
    return this.authService.getCurrentUser();
  }

  getCurrentUserName(): string {
    const user:LoginRequestModel = this.getCurrentUser();
    return user ? `${user.firstname} ${user.lastname}` : 'User';
  }

  getCurrentUserEmail(): string {
    const user = this.getCurrentUser();
    return user ? user.email : 'user@example.com';
  }

  getCurrentUserInitials(): string {
    const user = this.getCurrentUser();
    if (user && user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  }

  navigateToChat(): void {
    this.router.navigate(['/chat']);
  }

  navigateToAllUsers(): void {
    this.router.navigate(['/all-users']);
  }

  navigateToEducation(): void {
    this.router.navigate(['/education']);
  }

  navigateToArchitecturalCalculator(): void {
    this.router.navigate(['/architectural-calculator']);
  }

  navigateToAbout(): void {
    this.router.navigate(['/about']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
