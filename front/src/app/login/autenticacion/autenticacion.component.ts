import { Component } from '@angular/core';
import { AutenticacionServiceService } from '../autenticacion-service.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-autenticacion',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './autenticacion.component.html',
  styleUrl: './autenticacion.component.css'
})
export class AutenticacionComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AutenticacionServiceService, private router: Router) { }

  theme = environment.theme;

  ngOnInit() {
    document.documentElement.style.setProperty('--primary-color', this.theme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', this.theme.secondaryColor);
    document.documentElement.style.setProperty('--background-color', this.theme.background);
  }

  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        console.log('Login exitoso');
        this.router.navigate(['/estudiantes']);
      },
      error: err => {
        console.error('Error en el login', err);
      }
    });
  }
}
