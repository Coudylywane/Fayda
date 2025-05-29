import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DahirasPage } from './dahiras.page';

describe('DahirasPage', () => {
  let component: DahirasPage;
  let fixture: ComponentFixture<DahirasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DahirasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
