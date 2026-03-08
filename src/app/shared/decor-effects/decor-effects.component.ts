import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-decor-effects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './decor-effects.component.html',
  styleUrl: './decor-effects.component.css'
})
export class DecorEffectsComponent {
  @Input() showRain = true;
}
