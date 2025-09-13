import {Routes} from '@angular/router';
import {WelcomeComponent} from './welcome/welcome.component';

export const routes: Routes = [
  {path: '', component: WelcomeComponent},
  {path: 'register', loadChildren: () => import('./register/register.module').then(m => m.RegisterModule)},
  {path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule)},
  {path: '**', redirectTo: ''}
];
