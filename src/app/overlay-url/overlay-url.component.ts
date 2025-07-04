import { Component, EventEmitter, Output, Input } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-overlay-url',
  imports: [InputTextModule],
  templateUrl: './overlay-url.component.html',
  styleUrl: './overlay-url.component.scss'
})
export class OverlayUrlComponent {
  @Output() close = new EventEmitter<void>();
  @Input() gameId!: string;

  selectAll(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.select();
  }
}
