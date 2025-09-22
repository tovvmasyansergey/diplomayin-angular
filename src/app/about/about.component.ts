import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
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

  navigateToContact() {
    this.router.navigate(['/contact']);
  }

  // Методы для социальных сетей
  openLinkedIn() {
    window.open('https://linkedin.com/in/yourprofile', '_blank');
  }

  openGitHub() {
    window.open('https://github.com/yourusername', '_blank');
  }

  openTwitter() {
    window.open('https://twitter.com/yourusername', '_blank');
  }

  openInstagram() {
    window.open('https://instagram.com/yourusername', '_blank');
  }
}