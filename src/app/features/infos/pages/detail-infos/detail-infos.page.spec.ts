import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailInfosPage } from './detail-infos.page';

describe('DetailInfosPage', () => {
  let component: DetailInfosPage;
  let fixture: ComponentFixture<DetailInfosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailInfosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
