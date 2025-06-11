import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayUrlComponent } from './overlay-url.component';

describe('OverlayUrlComponent', () => {
  let component: OverlayUrlComponent;
  let fixture: ComponentFixture<OverlayUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayUrlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverlayUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
