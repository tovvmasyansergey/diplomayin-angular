import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RegisterRequestModel } from '../models/user-model/register-request.model';
import { LoginRequestModel } from '../models/user-model/login.request.model';
import {AuthService} from '../service/auth.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  imports: [FormsModule, NgIf]
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  firstname: string = '';
  lastname: string = '';
  phone: string = '';
  location: string = '';
  agreeTerms: boolean = false;
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  // File upload properties
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // Validation errors
  emailError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';
  firstnameError: string = '';
  lastnameError: string = '';
  phoneError: string = '';
  fileError: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onRegister() {
    if (!this.validateAll()) {
      return;
    }

    if (!this.agreeTerms) {
      alert('Please agree to the terms and conditions!');
      return;
    }
    this.isLoading = true;

    // Создаем FormData для отправки всех данных
    const formData = new FormData();
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('firstname', this.firstname);
    formData.append('lastname', this.lastname);
    formData.append('phone', this.phone);
    
    if (this.location) {
      formData.append('location', this.location);
    }
    
    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
    }

    this.authService.register(formData).subscribe({
      next: () => {
        this.router.navigate(['/app']);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.isLoading = false;
        alert('Registration failed. Please try again.');
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

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // File upload methods
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.validateFile(file);
    }
  }

  validateFile(file: File): void {
    this.fileError = '';

    // Check file type
    if (!file.type.startsWith('image/')) {
      this.fileError = 'Please select an image file';
      return;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.fileError = 'File size must be less than 5MB';
      return;
    }

    // If validation passes, set the file and create preview
    this.selectedFile = file;
    this.createImagePreview(file);
  }

  createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.fileError = '';
  }

  // Validation methods
  validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email) {
      this.emailError = 'Email cannot be empty';
      return false;
    }
    if (!emailRegex.test(this.email)) {
      this.emailError = 'Email must be valid';
      return false;
    }
    this.emailError = '';
    return true;
  }

  validatePassword(): boolean {
    if (!this.password) {
      this.passwordError = 'Password cannot be empty';
      return false;
    }
    if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      return false;
    }
    this.passwordError = '';
    return true;
  }

  validateConfirmPassword(): boolean {
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Confirm password cannot be empty';
      return false;
    }
    if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
      return false;
    }
    this.confirmPasswordError = '';
    return true;
  }

  validateFirstname(): boolean {
    if (!this.firstname) {
      this.firstnameError = 'First name cannot be empty';
      return false;
    }
    if (this.firstname.length < 2 || this.firstname.length > 50) {
      this.firstnameError = 'First name must be between 2 and 50 characters';
      return false;
    }
    this.firstnameError = '';
    return true;
  }

  validateLastname(): boolean {
    if (!this.lastname) {
      this.lastnameError = 'Last name cannot be empty';
      return false;
    }
    if (this.lastname.length < 2 || this.lastname.length > 50) {
      this.lastnameError = 'Last name must be between 2 and 50 characters';
      return false;
    }
    this.lastnameError = '';
    return true;
  }

  validatePhone(): boolean {
    if (!this.phone) {
      this.phoneError = 'Phone cannot be empty';
      return false;
    }
    if (this.phone.length < 7 || this.phone.length > 20) {
      this.phoneError = 'Phone must be between 7 and 20 characters';
      return false;
    }
    this.phoneError = '';
    return true;
  }

  validateAll(): boolean {
    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();
    const isConfirmPasswordValid = this.validateConfirmPassword();
    const isFirstnameValid = this.validateFirstname();
    const isLastnameValid = this.validateLastname();
    const isPhoneValid = this.validatePhone();

    return isEmailValid && isPasswordValid && isConfirmPasswordValid &&
           isFirstnameValid && isLastnameValid && isPhoneValid;
  }
}
