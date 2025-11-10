import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Estudiante } from './Interfaces/estudiante.interface';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GestionEstudiantesServiceService {
  private baseUrl = environment.apiUrl;

  //private endpoint: string = "localhost:5000";
  private apiUrl: string = `${this.baseUrl}/listaEstudiantes`;
  private apiGetByCodigo: string = `${this.baseUrl}/obtenerEstudiante`;
  private api2Url: string = `${this.baseUrl}/crearEstudiante`;
  private api3Url: string = `${this.baseUrl}/actualizarEstudiante`;
  private api4Url: string = `${this.baseUrl}/eliminarEstudiante`;

  constructor(private http: HttpClient) { }

  private getToken(): string {
    return localStorage.getItem('token') || '';
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
  }



  getEstudiantes():Observable<Estudiante[]> {

    return this.http.get<Estudiante[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getEstudiante(codigo: string): Observable<Estudiante> {

    return this.http.get<Estudiante>(`${this.apiGetByCodigo}/${codigo}`, { headers: this.getHeaders() });
  }

  addEstudiante( estudiante: Estudiante ): Observable<Estudiante> {
    return this.http.post<Estudiante>(`${ this.api2Url }`, estudiante );
  }


  updateEstudiante( estudiante: Estudiante ): Observable<Estudiante> {
    if ( !estudiante.codigo ) throw Error('Estudiante sin identificar');

    return this.http.put<Estudiante>(`${ this.api3Url }/${ estudiante.codigo }`, estudiante );
  }

  deleteEstudianteByCode( codigo: string ): Observable<boolean> {

    return this.http.delete(`${ this.api4Url }/${ codigo }`)
      .pipe(
        map( resp => true ),
        catchError( err => of(false) ),
      );
  }

}
