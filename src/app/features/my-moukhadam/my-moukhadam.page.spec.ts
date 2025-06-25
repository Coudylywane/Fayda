import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyMoukhadamPage } from './my-moukhadam.page';

describe('MyMoukhadamPage', () => {
  let component: MyMoukhadamPage;
  let fixture: ComponentFixture<MyMoukhadamPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyMoukhadamPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
