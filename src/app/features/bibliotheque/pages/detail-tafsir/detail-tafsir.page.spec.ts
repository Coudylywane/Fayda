import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailTafsirPage } from './detail-tafsir.page';

describe('DetailTafsirPage', () => {
  let component: DetailTafsirPage;
  let fixture: ComponentFixture<DetailTafsirPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailTafsirPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
