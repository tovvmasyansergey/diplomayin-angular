import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './login.component';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

const routes: Routes = [
  { path: '', component: LoginComponent }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes), LoginComponent]
})
export class LoginModule {}
