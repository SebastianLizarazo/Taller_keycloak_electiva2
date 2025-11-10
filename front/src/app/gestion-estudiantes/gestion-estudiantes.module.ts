import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routes } from './gestion-estudiantes.routing.module';
import { GestionEstudiantesServiceService } from './gestion-estudiantes-service.service';
import { ListarEstudiantesComponent } from './listar-estudiantes/listar-estudiantes.component';
import { CrearEstudiantesComponent } from './crear-estudiantes/crear-estudiantes.component';
import { ActualizarEstudiantesComponent } from './actualizar-estudiantes/actualizar-estudiantes.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ListarEstudiantesComponent,
    CrearEstudiantesComponent,
    ActualizarEstudiantesComponent
  ],
  providers: [GestionEstudiantesServiceService]
})
export class GestionEstudiantesModule { }
