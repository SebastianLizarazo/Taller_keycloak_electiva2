import { ChangeDetectorRef, Component } from '@angular/core';
import { Estudiante } from '../Interfaces/estudiante.interface';
import { GestionEstudiantesServiceService } from '../gestion-estudiantes-service.service';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-listar-estudiantes',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './listar-estudiantes.component.html',
  styleUrl: './listar-estudiantes.component.css'
})
export class ListarEstudiantesComponent {
  public estudiantes: Estudiante[]= [];

  constructor(private estudianteService: GestionEstudiantesServiceService,
    private router: Router,
    private cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
      this.estudianteService.getEstudiantes().subscribe({
        next: (result) => {
          console.log("Respuesta completa: ", result);
          this.estudiantes = result;
         this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error al obtener los datos: ", err);
        }
      });
      console.log(this.estudiantes);
    }


    crearEstudiante(): void {
      this.router.navigate(['/estudiantes/crear']);
    }

    actualizarEstudiante(codigo: string): void {
    this.router.navigate(['/estudiantes/actualizar', codigo]);
    }

    eliminarEstudiante(codigo: string): void {
    this.estudianteService.deleteEstudianteByCode(codigo).subscribe({
      next: () => {
        alert('Estudiante eliminado con éxito');
        window.location.reload();
      },
      error: (err) => {
        console.error('Error al eliminar estudiante:', err);
        alert('No se pudo eliminar el estudiante');
      },
    });
    }
}
