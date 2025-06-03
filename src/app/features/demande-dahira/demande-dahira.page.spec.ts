import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DemandeDahiraPage } from './demande-dahira.page';

describe('DemandeDahiraPage', () => {
  let component: DemandeDahiraPage;
  let fixture: ComponentFixture<DemandeDahiraPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DemandeDahiraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
