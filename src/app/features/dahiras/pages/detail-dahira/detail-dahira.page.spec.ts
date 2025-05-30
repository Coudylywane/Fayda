import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailDahiraPage } from './detail-dahira.page';

describe('DetailDahiraPage', () => {
  let component: DetailDahiraPage;
  let fixture: ComponentFixture<DetailDahiraPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailDahiraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
