import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RegisterRequestModel } from '../models/user-model/register-request.model';
import {AuthService} from '../service/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  imports: [FormsModule]
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  agreeTerms: boolean = false;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onRegister() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (!this.agreeTerms) {
      alert('Please agree to the terms and conditions!');
      return;
    }

    if (!this.username || !this.email || !this.password) {
      alert('Please fill in all fields!');
      return;
    }

    this.isLoading = true;

    const registerData: RegisterRequestModel = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.authService.register(registerData).subscribe({
      next: (response: any) => {
        console.log('Registration successful:', response);
        alert('Registration successful! Please check your email for verification code.');
        this.router.navigate(['/login']);
      },
      error: (error: { error: { message: any; }; }) => {
        console.error('Registration failed:', error);
        alert('Registration failed: ' + (error.error?.message || 'Unknown error'));
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
