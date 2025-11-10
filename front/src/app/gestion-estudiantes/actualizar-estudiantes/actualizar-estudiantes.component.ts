import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Estudiante } from '../Interfaces/estudiante.interface';
import { GestionEstudiantesServiceService } from '../gestion-estudiantes-service.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-actualizar-estudiantes',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './actualizar-estudiantes.component.html',
  styleUrl: './actualizar-estudiantes.component.css'
})
export class ActualizarEstudiantesComponent {
  estudianteForm!: FormGroup;
  codigo: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private estudianteService: GestionEstudiantesServiceService
  ) { }

  ngOnInit(): void {
    this.codigo = this.route.snapshot.paramMap.get('codigo') || '';

    this.estudianteForm = this.fb.group({
      codigo: [{ value: '', disabled: true }],
      nombre: ['', Validators.required],
      promedio: ['', [Validators.required, Validators.min(0), Validators.max(5)]],
    });

    this.estudianteService.getEstudiante(this.codigo).subscribe({
      next: (estudiante) => {
        this.estudianteForm.patchValue(estudiante);
      },
      error: (err) => {
        console.error('Error al cargar estudiante:', err);
        alert('No se pudo cargar el estudiante');
      },
    });
  }

  onSubmit(): void {
    if (this.estudianteForm.valid) {
      const estudianteActualizado: Estudiante = {
        codigo: this.codigo,
        ...this.estudianteForm.getRawValue()
      };

      this.estudianteService.updateEstudiante(estudianteActualizado).subscribe({
        next: () => {
          alert('Estudiante actualizado con éxito');
          this.router.navigate(['/estudiantes']);
        },
        error: (err) => {
          console.error('Error al actualizar estudiante:', err);
          alert('No se pudo actualizar el estudiante');
        },
      });
    }
  }
}
