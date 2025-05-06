import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailOuvragePage } from './detail-ouvrage.page';

describe('DetailOuvragePage', () => {
  let component: DetailOuvragePage;
  let fixture: ComponentFixture<DetailOuvragePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailOuvragePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
