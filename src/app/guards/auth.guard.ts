import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {AuthService} from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    const currentUser = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    
    console.log('AuthGuard check:', {
      isLoggedIn,
      hasToken: !!token,
      hasCurrentUser: !!currentUser,
      token: token ? token.substring(0, 20) + '...' : 'null',
      user: currentUser ? { id: currentUser.id, email: currentUser.email } : 'null'
    });
    
    if (isLoggedIn && currentUser && token) {
      return true;
    } else {
      console.log('AuthGuard: Redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }
  }
}

