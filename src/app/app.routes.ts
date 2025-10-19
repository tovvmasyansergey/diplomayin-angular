import {Routes} from '@angular/router';
import {WelcomeComponent} from './welcome/welcome.component';
import {EducationComponent} from './education/education.component';
import {ContactComponent} from './contact/contact.component';
import {AboutComponent} from './about/about.component';
import {AllUsersComponent} from './all-users/all-users.component';
import {ChatComponent} from './chat/chat.component';
import {ApplicationComponent} from './application/application';
import {AuthGuard} from './guards/auth.guard';

export const routes: Routes = [
  {path: '', component: WelcomeComponent},
  {path: 'application', component: ApplicationComponent, canActivate: [AuthGuard]},
  {path: 'education', component: EducationComponent},
  {path: 'contact', component: ContactComponent},
  {path: 'about', component: AboutComponent},
  {path: 'all-users', component: AllUsersComponent, canActivate: [AuthGuard]},
  {path: 'chat', component: ChatComponent, canActivate: [AuthGuard]},
  {path: 'register', loadChildren: () => import('./register/register.module').then(m => m.RegisterModule)},
  {path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule)},
  {path: '**', redirectTo: ''}
];
