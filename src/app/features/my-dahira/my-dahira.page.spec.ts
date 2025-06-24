import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyDahiraPage } from './my-dahira.page';

describe('MyDahiraPage', () => {
  let component: MyDahiraPage;
  let fixture: ComponentFixture<MyDahiraPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyDahiraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
