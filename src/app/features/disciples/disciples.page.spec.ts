import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisciplesPage } from './disciples.page';

describe('DisciplesPage', () => {
  let component: DisciplesPage;
  let fixture: ComponentFixture<DisciplesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DisciplesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
