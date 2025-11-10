import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarEstudiantesComponent } from './actualizar-estudiantes.component';

describe('ActualizarEstudiantesComponent', () => {
  let component: ActualizarEstudiantesComponent;
  let fixture: ComponentFixture<ActualizarEstudiantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarEstudiantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActualizarEstudiantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
