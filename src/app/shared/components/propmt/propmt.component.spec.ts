import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropmtComponent } from './propmt.component';

describe('PropmtComponent', () => {
  let component: PropmtComponent;
  let fixture: ComponentFixture<PropmtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropmtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
