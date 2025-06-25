import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyCollectePage } from './my-collecte.page';

describe('MyCollectePage', () => {
  let component: MyCollectePage;
  let fixture: ComponentFixture<MyCollectePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyCollectePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
