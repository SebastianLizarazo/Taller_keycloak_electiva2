import { Component } from '@angular/core';
import { Estudiante } from '../Interfaces/estudiante.interface';
import { GestionEstudiantesServiceService } from '../gestion-estudiantes-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-estudiantes',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './crear-estudiantes.component.html',
  styleUrl: './crear-estudiantes.component.css'
})
export class CrearEstudiantesComponent {

estudianteForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private estudianteService: GestionEstudiantesServiceService,
    private router: Router
  ) {
    this.estudianteForm = this.fb.group({
      nombre: ['', Validators.required],
      codigo: ['', Validators.required],
      promedio: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.estudianteForm.valid) {
      const nuevoEstudiante: Estudiante = this.estudianteForm.value;

      this.estudianteService.addEstudiante(nuevoEstudiante).subscribe({
        next: (res) => {
          console.log('Estudiante creado:', res);
          alert('Estudiante creado con éxito');
          this.estudianteForm.reset();
          this.router.navigate(['/estudiantes']);
        },
        error: (err) => {
          console.error('Error al crear estudiante:', err);
          alert('Error al guardar el estudiante');
        },
      });
    }
  }
}
