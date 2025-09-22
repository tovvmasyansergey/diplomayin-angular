import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../service/user.service';

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  location?: string;
  profilePicture?: string;
  role?: string;
}

@Component({
  selector: 'app-all-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-users.component.html',
  styleUrl: './all-users.component.css'
})
export class AllUsersComponent implements OnInit {
  users: User[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  showChatModal: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users';
        this.isLoading = false;
      }
    });
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToEducation(): void {
    this.router.navigate(['/education']);
  }

  navigateToContact(): void {
    this.router.navigate(['/contact']);
  }

  navigateToAbout(): void {
    this.router.navigate(['/about']);
  }

  startChat(user: User): void {
    // TODO: Implement chat functionality
    console.log('Starting chat with user:', user);
    alert(`Starting chat with ${user.firstname} ${user.lastname}`);
  }

  getInitials(user: User): string {
    return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
  }

  // Chat methods
  openChatModal(): void {
    this.showChatModal = true;
  }

  closeChatModal(): void {
    this.showChatModal = false;
  }

  startAdminChat(): void {
    this.closeChatModal();
    // TODO: Implement admin chat functionality
    console.log('Starting admin chat...');
    alert('Starting chat with admin...');
  }

  startAIChat(): void {
    this.closeChatModal();
    // TODO: Implement AI chat functionality
    console.log('Starting AI chat...');
    alert('Starting AI Assistant chat...');
  }

  startGPTChat(): void {
    this.closeChatModal();
    // TODO: Implement GPT chat functionality
    console.log('Starting GPT chat...');
    alert('Starting GPT chat...');
  }
}
