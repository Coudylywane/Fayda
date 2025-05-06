import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LireOuvragePage } from './lire-ouvrage.page';

describe('LireOuvragePage', () => {
  let component: LireOuvragePage;
  let fixture: ComponentFixture<LireOuvragePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LireOuvragePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
