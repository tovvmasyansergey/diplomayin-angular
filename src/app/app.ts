import {Component, OnInit, signal} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {AuthService} from './service/auth.service';
import { DecorEffectsComponent } from './shared/decor-effects/decor-effects.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DecorEffectsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(
    private authService: AuthService,
    public router: Router
  ) { }
  ngOnInit(): void {
    this.authService.initSession();
  }
  protected readonly title = signal('diplomayin-angular');

}
