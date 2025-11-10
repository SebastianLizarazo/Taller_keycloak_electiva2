import { TestBed } from '@angular/core/testing';

import { GestionEstudiantesServiceService } from './gestion-estudiantes-service.service';

describe('GestionEstudiantesServiceService', () => {
  let service: GestionEstudiantesServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestionEstudiantesServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
