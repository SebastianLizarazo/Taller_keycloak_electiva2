import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutenticacionComponent } from './login/autenticacion/autenticacion.component';
import { ActualizarEstudiantesComponent, CrearEstudiantesComponent, ListarEstudiantesComponent } from './gestion-estudiantes';

/* Anteriormente se tenia esta configuracion de rutas directamente en este archivo
export const routes: Routes = [
    { path: '', component: AutenticacionComponent },
    { path: 'listaEstudiantes', component: ListarEstudiantesComponent },
    { path: 'crearEstudiante', component: CrearEstudiantesComponent },
    { path: 'actualizarEstudiante/:codigo', component: ActualizarEstudiantesComponent },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];
*/

export const routes: Routes = [
    { path: '', component: AutenticacionComponent },
    { path: 'estudiantes',
        loadChildren: () => import('./gestion-estudiantes/gestion-estudiantes.module').then(m => m.GestionEstudiantesModule)
    },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }
