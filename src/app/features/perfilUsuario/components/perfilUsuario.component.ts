import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../dashboard/services/auth.service';
import { PerfilService, UsuarioPerfil } from '../services/perfil.service';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfilUsuario.component.html',
  styleUrls: ['./perfilUsuario.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PerfilUsuarioComponent implements OnInit {

  perfil: UsuarioPerfil | null = null;
  cargando = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private perfilService: PerfilService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuario();
    console.log('[Perfil] usuario del token:', usuario);

    if (!usuario) {
      this.error = 'No se encontró sesión activa.';
      this.cargando = false;
      return;
    }

    console.log('[Perfil] llamando GET /api/usuario/' + usuario.id);

    this.perfilService.obtenerPerfil(usuario.id).subscribe({
      next: data => {
        console.log('[Perfil] respuesta recibida:', data);
        this.perfil = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('[Perfil] error en la petición:', err);
        this.error = 'No se pudo cargar el perfil. Intenta de nuevo más tarde.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
