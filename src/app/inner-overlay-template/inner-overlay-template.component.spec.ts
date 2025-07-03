import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InnerOverlayTemplateComponent } from './inner-overlay-template.component';

describe('InnerOverlayTemplateComponent', () => {
  let component: InnerOverlayTemplateComponent;
  let fixture: ComponentFixture<InnerOverlayTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InnerOverlayTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InnerOverlayTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
