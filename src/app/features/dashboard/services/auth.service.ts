import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

export type RolUsuario =
  | 'dependencia'
  | 'admin-cd'
  | 'admin-infraestructura'
  | 'admin-vulnerabilidades'
  | 'admin-general';

export interface UsuarioActual {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
}

// Mapeo de los valores que envía el backend en el JWT → RolUsuario del frontend
export const ROL_MAP: Record<string, RolUsuario> = {
  // Enum del backend (C#) — valores exactos que llegan en el JWT
  'administrador_general':  'admin-general',
  'dependencia_cliente':    'dependencia',
  'admin_centro_datos':     'admin-cd',
  'admin_infraestructura':  'admin-infraestructura',
  'admin_vulnerabilidades': 'admin-vulnerabilidades',
};

@Injectable({ providedIn: 'root' })
export class AuthService {

  obtenerUsuario(): UsuarioActual | null {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);

      // El backend puede poner el rol en distintos claims
      const rolRaw: string =
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        decoded['Permisos'] ||
        decoded['rol'] ||
        decoded['role'] ||
        decoded['roles'] ||
        '';

      const rol = ROL_MAP[rolRaw.trim().toLowerCase().replace(/\s+/g, '_')] ?? 'dependencia';

      const id: string =
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
        decoded['id'] ||
        '';

      const nombre: string =
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
        decoded['nombre'] ||
        decoded['sub'] ||
        '';

      const correo: string =
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
        decoded['correo'] ||
        decoded['email'] ||
        '';

      return { id: String(id), nombre, correo, rol };
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

  esAdminGeneral(): boolean {
    return this.obtenerRol() === 'admin-general';
  }

  estaAutenticado(): boolean {
    return this.obtenerUsuario() !== null;
  }

  cerrarSesion(): void {
    sessionStorage.removeItem('jwtToken');
  }
}
