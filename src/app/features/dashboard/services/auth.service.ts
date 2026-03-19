import { Injectable } from '@angular/core';

export type RolUsuario =
  | 'dependencia'
  | 'admin-cd'
  | 'admin-infraestructura'
  | 'admin-vulnerabilidades';

export interface UsuarioActual {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  // ── Cuando llegue el backend cambia solo este método ──
  // Si usan JWT: parsea el token con atob()
  // Si usan localStorage: lee el objeto guardado al login
  obtenerUsuario(): UsuarioActual | null {
    const raw = localStorage.getItem('usuario');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UsuarioActual;
    } catch {
      return null;
    }
  }

  obtenerRol(): RolUsuario | null {
    return this.obtenerUsuario()?.rol ?? null;
  }

  esDependencia(): boolean {
    return this.obtenerRol() === 'dependencia';
  }

  esAdminCD(): boolean {
    return this.obtenerRol() === 'admin-cd';
  }

  esAdminInfraestructura(): boolean {
    return this.obtenerRol() === 'admin-infraestructura';
  }

  esAdminVulnerabilidades(): boolean {
    return this.obtenerRol() === 'admin-vulnerabilidades';
  }

  estaAutenticado(): boolean {
    return this.obtenerUsuario() !== null;
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuario');
  }
}
