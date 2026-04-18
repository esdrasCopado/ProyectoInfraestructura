import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService, RolUsuario } from '../../../features/dashboard/services/auth.service';

const ETIQUETA_ROL: Record<RolUsuario, string> = {
  'dependencia':            'Dependencia / Cliente',
  'admin-cd':               'Administrador de Centro de Datos',
  'admin-infraestructura':  'Administrador de Infraestructura',
  'admin-vulnerabilidades': 'Administrador de Vulnerabilidades',
  'admin-general':          'Administrador General',
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  nombreUsuario    = '';
  etiquetaRol      = '';
  iniciales        = '';
  esAdminGeneral = false;
  esDependencia  = false;
  paginaActual   = '';

  // Contadores — se conectarán al servicio correspondiente cuando exista
  totalNotificaciones = 0;
  totalMensajes       = 0;

  private readonly PAGINAS: Record<string, string> = {
    '/dashboard':               'Dashboard',
    '/carta-aprovisionamiento': 'Nueva solicitud',
    '/crear-usuario':           'Crear usuario',
    '/perfil-usuario':          'Mi perfil',
    '/notificaciones':          'Notificaciones',
    '/mensajes':                'Mensajes',
    '/historial':               'Historial de actividad',
    '/ayuda':                   'Ayuda',
    '/acerca':                  'Acerca del sistema',
  };

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuario();
    if (usuario) {
      this.nombreUsuario  = usuario.nombre || usuario.correo;
      this.etiquetaRol    = ETIQUETA_ROL[usuario.rol] ?? usuario.rol;
      this.iniciales      = this.calcularIniciales(this.nombreUsuario);
      this.esAdminGeneral = usuario.rol === 'admin-general';
      this.esDependencia  = usuario.rol === 'dependencia';
    }

    this.paginaActual = this.resolverPagina(this.router.url);

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => {
        this.paginaActual = this.resolverPagina((e as NavigationEnd).urlAfterRedirects);
      });
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }

  private resolverPagina(url: string): string {
    const ruta = '/' + url.split('/')[1].split('?')[0];
    return this.PAGINAS[ruta] ?? '';
  }

  private calcularIniciales(nombre: string): string {
    const partes = nombre.trim().split(/\s+/);
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombre.slice(0, 2).toUpperCase();
  }
}
