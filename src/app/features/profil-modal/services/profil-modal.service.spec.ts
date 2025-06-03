import { TestBed } from '@angular/core/testing';

import { ProfilModalService } from './profil-modal.service';

describe('ProfilModalService', () => {
  let service: ProfilModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfilModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
