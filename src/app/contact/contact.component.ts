import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  constructor(private router: Router) {}

  navigateToHome() {
    this.router.navigate(['/']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  navigateToEducation() {
    this.router.navigate(['/education']);
  }

  navigateToAbout() {
    this.router.navigate(['/about']);
  }

  // Методы для контактных действий
  sendEmail() {
    window.location.href = 'mailto:contact@example.com?subject=Hello from Website';
  }

  makeCall() {
    window.location.href = 'tel:+1234567890';
  }

  openLinkedIn() {
    window.open('https://linkedin.com/in/yourprofile', '_blank');
  }

  openGitHub() {
    window.open('https://github.com/yourusername', '_blank');
  }
}