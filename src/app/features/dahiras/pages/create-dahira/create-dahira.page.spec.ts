import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateDahiraPage } from './create-dahira.page';

describe('CreateDahiraPage', () => {
  let component: CreateDahiraPage;
  let fixture: ComponentFixture<CreateDahiraPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDahiraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
