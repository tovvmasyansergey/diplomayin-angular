import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../service/user.service';
import { AuthService } from '../service/auth.service';

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
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './all-users.component.html',
  styleUrl: './all-users.component.css'
})
export class AllUsersComponent implements OnInit {
  users: User[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  showChatModal: boolean = false;

  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 15;
  totalPages: number = 0;
  totalElements: number = 0;
  totalPagesArray: number[] = [];

  // Edit modal properties
  showEditModal: boolean = false;
  editingUser: User = {
    id: 0,
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    location: '',
    profilePicture: '',
    role: ''
  };
  selectedEditFile: File | null = null;
  editImagePreview: string | null = null;
  isSaving: boolean = false;

  // Delete modal properties
  showDeleteModal: boolean = false;
  deletingUser: User | null = null;
  isDeleting: boolean = false;

  currentUser: any = null;

  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUsers();
  }

  loadUsers(page: number = this.currentPage): void {
    this.isLoading = true;
    this.currentPage = page;
    this.authService.getAllUsers(page, this.pageSize).subscribe({
      next: (response: any) => {
        this.users = response.content || [];
        this.totalPages = response.totalPages || 0;
        this.totalElements = response.totalElements || 0;
        this.currentPage = response.number || 0;
        this.generatePagesArray();
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
    console.log('Starting chat with user:', user);
    // Переходим к чату с выбранным пользователем
    this.router.navigate(['/chat'], {
      queryParams: {
        userId: user.id,
        userName: `${user.firstname} ${user.lastname}`
      }
    });
  }

  getInitials(user: User): string {
    return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
  }

  getProfilePictureUrl(profilePicture: string): string {
    if (!profilePicture) return '';

    // Если URL уже полный (начинается с http), возвращаем как есть
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }

    // Определяем URL бэкенда на основе текущего хоста
    const hostname = window.location.hostname;
    const backendUrl = (hostname === 'localhost' || hostname === '127.0.0.1') 
      ? 'http://localhost:7404' 
      : `http://${hostname}:7404`;

    // Если URL относительный (начинается с /), добавляем базовый URL бэкенда
    if (profilePicture.startsWith('/')) {
      return backendUrl + profilePicture;
    }

    // Если URL не начинается с /, добавляем базовый URL и /
    return backendUrl + '/' + profilePicture;
  }

  // Pagination methods
  generatePagesArray(): void {
    this.totalPagesArray = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      this.totalPagesArray.push(i);
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.loadUsers(page);
    }
  }

  goToFirstPage(): void {
    this.goToPage(0);
  }

  goToLastPage(): void {
    this.goToPage(this.totalPages - 1);
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.goToPage(this.currentPage + 1);
    }
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

  // Edit user methods
  editUser(user: User): void {
    // Проверка прав доступа перед редактированием
    if (!this.canEditUser(user)) {
      alert('You do not have permission to edit this user');
      return;
    }

    this.editingUser = { ...user };
    this.selectedEditFile = null;
    this.editImagePreview = null;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingUser = {
      id: 0,
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      location: '',
      profilePicture: '',
      role: ''
    };
    this.selectedEditFile = null;
    this.editImagePreview = null;
  }

  onEditFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.validateEditFile(file);
    }
  }

  validateEditFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    this.selectedEditFile = file;
    this.createEditImagePreview(file);
  }

  createEditImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.editImagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeEditFile(): void {
    this.selectedEditFile = null;
    this.editImagePreview = null;
  }

  saveUser(): void {
    if (!this.editingUser) return;

    // Дополнительная проверка прав доступа перед сохранением
    if (!this.canEditUser(this.editingUser)) {
      alert('You do not have permission to edit this user');
      this.closeEditModal();
      return;
    }

    this.isSaving = true;
    const formData = new FormData();

    formData.append('firstname', this.editingUser.firstname);
    formData.append('lastname', this.editingUser.lastname);
    formData.append('email', this.editingUser.email);
    formData.append('phone', this.editingUser.phone);

    if (this.editingUser.location) {
      formData.append('location', this.editingUser.location);
    }

    if (this.selectedEditFile) {
      formData.append('profilePicture', this.selectedEditFile);
    }

    this.authService.editUser(this.editingUser.id, formData).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadUsers(this.currentPage); // Reload current page
        alert('User updated successfully');
      },
      error: (error) => {
        console.error('Error updating user:', error);
        // Показываем более информативное сообщение об ошибке
        if (error.status === 403) {
          alert('You do not have permission to edit this user');
        } else if (error.status === 401) {
          alert('Please log in to continue');
        } else {
          alert('Failed to update user: ' + (error.error || error.message || 'Unknown error'));
        }
        this.isSaving = false;
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }

  // Delete user methods
  deleteUser(user: User): void {
    // Проверка прав доступа перед удалением
    if (!this.canDeleteUser(user)) {
      alert('Only administrators can delete users');
      return;
    }

    this.deletingUser = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletingUser = null;
  }

  confirmDelete(): void {
    if (!this.deletingUser) return;

    // Дополнительная проверка прав доступа перед удалением
    if (!this.canDeleteUser(this.deletingUser)) {
      alert('Only administrators can delete users');
      this.closeDeleteModal();
      return;
    }

    this.isDeleting = true;
    this.authService.deleteUser(this.deletingUser.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadUsers(this.currentPage); // Reload current page
        alert('User deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        // Показываем более информативное сообщение об ошибке
        if (error.status === 403) {
          alert('Only administrators can delete users');
        } else if (error.status === 401) {
          alert('Please log in to continue');
        } else {
          alert('Failed to delete user: ' + (error.error || error.message || 'Unknown error'));
        }
        this.isDeleting = false;
      },
      complete: () => {
        this.isDeleting = false;
      }
    });
  }

  // Проверка прав доступа
  canEditUser(user: User): boolean {
    if (!this.currentUser) return false;
    // Пользователь может редактировать только себя (админ не может редактировать других)
    return this.currentUser.id === user.id;
  }

  canDeleteUser(user: User): boolean {
    if (!this.currentUser) return false;
    // Админ может удалять всех, пользователь может удалить только себя
    return this.isAdmin() || this.currentUser.id === user.id;
  }

  isAdmin(): boolean {
    if (!this.currentUser || !this.currentUser.role) return false;
    return this.currentUser.role === 'ADMIN';
  }

  protected readonly Math = Math;
}
