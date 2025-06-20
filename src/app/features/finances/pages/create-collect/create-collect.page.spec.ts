import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateCollectPage } from './create-collect.page';

describe('CreateCollectPage', () => {
  let component: CreateCollectPage;
  let fixture: ComponentFixture<CreateCollectPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCollectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
