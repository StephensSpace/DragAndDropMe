import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-overlay-url',
  imports: [],
  templateUrl: './overlay-url.component.html',
  styleUrl: './overlay-url.component.scss'
})
export class OverlayUrlComponent {
  @Output() close = new EventEmitter<void>();
  @Input() gameId!: string;

  closeOverlay(){
    this.close.emit();
  }
}
