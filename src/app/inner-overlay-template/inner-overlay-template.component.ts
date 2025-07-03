import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-inner-overlay-template',
  imports: [],
  templateUrl: './inner-overlay-template.component.html',
  styleUrl: './inner-overlay-template.component.scss'
})
export class InnerOverlayTemplateComponent {
  @Input() backgroundImage?: string;
  @Input() width!: number;
  @Input() height!: number; 
}
