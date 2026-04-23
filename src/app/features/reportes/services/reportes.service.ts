import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  FiltrosReporte,
  Reporte11Fila, Reporte12Fila, Reporte12Response, Reporte13Fila,
  Reporte21Fila, Reporte22Fila,
  Reporte31Fila, Reporte32Fila,
  Reporte41Fila, Reporte42Fila,
} from '../models/reporte.model';

const MOCK_BASE: Reporte11Fila[] = [
  { folioSolicitud: 'SOL-2025-001', dependencia: 'STPS / Secretaría del Trabajo', responsable: 'Juan Pérez',  contacto: 'juan.perez@sonora.gob.mx',    estatusProcesamieto: 'En proceso', fechaCreacion: '2025-01-10' },
  { folioSolicitud: 'SOL-2025-002', dependencia: 'ISSSTESON / Salud',              responsable: 'María López', contacto: 'maria.lopez@isssteson.gob.mx', estatusProcesamieto: 'Completado', fechaCreacion: '2025-01-20' },
  { folioSolicitud: 'SOL-2025-003', dependencia: 'SEDESSON / Desarrollo Social',   responsable: 'Carlos Ruiz', contacto: 'carlos.ruiz@sedesson.gob.mx',  estatusProcesamieto: 'Pendiente',  fechaCreacion: '2025-02-05' },
];

const MOCK_SERVIDOR: Reporte12Fila[] = MOCK_BASE.map((r, i) => ({
  ...r,
  ipServidor:             `10.0.${i}.${10 + i}`,
  administradorServidor:  `Admin Infraestructura ${i + 1}`,
  descripcionProyecto:    `Sistema de gestión institucional ${i + 1}`,
  sistemaOperativo:       i % 2 === 0 ? 'Linux Ubuntu 22.04' : 'Windows Server 2022',
  vcpu:                   4 * (i + 1),
  ram:                    8 * (i + 1),
  almacenamiento:         200 * (i + 1),
}));

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly base = `${environment.apiUrl}/reporte`;

  constructor(private http: HttpClient) {}

  // ── 1.x Admin Centro de Datos ──────────────────────────────────────────────

  getReporte11(filtros: FiltrosReporte): Observable<Reporte11Fila[]> {
    if (environment.useMock) return of(MOCK_BASE);
    return this.http.get<Reporte11Fila[]>(`${this.base}/solicitudes/por-dependencia`, { params: filtros as any });
  }

  getReporte12(filtros: FiltrosReporte): Observable<Reporte12Response> {
    if (environment.useMock) return of({
      items: MOCK_SERVIDOR,
      totalVcpu:         MOCK_SERVIDOR.reduce((s, r) => s + r.vcpu, 0),
      totalRam:          MOCK_SERVIDOR.reduce((s, r) => s + r.ram, 0),
      totalAlmacenamiento: MOCK_SERVIDOR.reduce((s, r) => s + r.almacenamiento, 0),
    });
    return this.http.get<Reporte12Response>(`${this.base}/solicitudes/recursos-solicitados`, { params: filtros as any });
  }

  getReporte13(ip: string, filtros: FiltrosReporte): Observable<Reporte13Fila[]> {
    if (environment.useMock) {
      return of(MOCK_SERVIDOR.map(r => ({
        ...r,
        subdominioAprobado: `app-${r.folioSolicitud.toLowerCase()}.sonora.gob.mx`,
        vpns: 'VPN-2025-001',
      })));
    }
    return this.http.get<Reporte13Fila[]>(`${this.base}/solicitudes/por-ip`, { params: { ip, ...filtros } as any });
  }

  // ── 2.x Admin Infraestructura ──────────────────────────────────────────────

  getReporte21(filtros: FiltrosReporte): Observable<Reporte21Fila[]> {
    if (environment.useMock) {
      return of([
        { folio: 'SOL-2025-001', sectorDependencia: 'STPS / Secretaría del Trabajo',   responsableServidor: 'Juan Pérez',  contacto: 'juan.perez@sonora.gob.mx',  estatus: 'Activo', ipServidor: '10.0.0.10', identificadorVpn: 'VPN-2025-001', usuarioAsignado: 'jperez',  fechaCreacion: '2025-01-15', fechaVencimiento: '2025-04-15', vigencia: '90 días', tipoVpn: 'Usuario VPN de dependencia'   },
        { folio: 'SOL-2025-002', sectorDependencia: 'ISSSTESON / Salud',                responsableServidor: 'María López', contacto: 'maria.lopez@isssteson.gob.mx', estatus: 'Activo', ipServidor: '10.0.1.11', identificadorVpn: 'VPN-2025-002', usuarioAsignado: 'mlopez', fechaCreacion: '2025-02-01', fechaVencimiento: '2025-05-01', vigencia: '90 días', tipoVpn: 'Usuario VPN para proveedor'    },
        { folio: 'SOL-2025-003', sectorDependencia: 'SEDESSON / Desarrollo Social',     responsableServidor: 'Carlos Ruiz', contacto: 'carlos.ruiz@sedesson.gob.mx',  estatus: 'Vencido', ipServidor: '10.0.2.12', identificadorVpn: 'VPN-2025-003', usuarioAsignado: 'cruiz',  fechaCreacion: '2025-01-05', fechaVencimiento: '2025-02-04', vigencia: '30 días', tipoVpn: 'Actualización de usuario VPN' },
      ]);
    }
    return this.http.get<Reporte21Fila[]>(`${this.base}/infraestructura/vpn`, { params: filtros as any });
  }

  getReporte22(filtros: FiltrosReporte): Observable<Reporte22Fila[]> {
    if (environment.useMock) {
      return of([
        { folio: 'SOL-2025-001', sectorDependencia: 'STPS / Secretaría del Trabajo', responsableServidor: 'Juan Pérez',  contacto: 'juan.perez@sonora.gob.mx',    estatus: 'Activo', ipServidor: '10.0.0.10', subdominioAprobado: 'stps.sonora.gob.mx',     proxyAsignado: 'nginx-01', tipoDespliegue: 'publicado', puertoPublicacion: '443' },
        { folio: 'SOL-2025-002', sectorDependencia: 'ISSSTESON / Salud',              responsableServidor: 'María López', contacto: 'maria.lopez@isssteson.gob.mx', estatus: 'Activo', ipServidor: '10.0.1.11', subdominioAprobado: 'expedientes.isssteson.gob.mx', proxyAsignado: 'nginx-02', tipoDespliegue: 'interno',   puertoPublicacion: '8080' },
      ]);
    }
    return this.http.get<Reporte22Fila[]>(`${this.base}/infraestructura/subdominios`, { params: filtros as any });
  }

  // ── 3.x Admin Vulnerabilidades ─────────────────────────────────────────────

  getReporte31(filtros: FiltrosReporte): Observable<Reporte31Fila[]> {
    if (environment.useMock) {
      return of([
        { folio: 'SOL-2025-001', sectorDependencia: 'STPS / Secretaría del Trabajo', responsableServidor: 'Juan Pérez',  telefonoContacto: '6621234567', correoContacto: 'juan.perez@sonora.gob.mx',    estatus: 'Completado',  ipServidor: '10.0.0.10', subdominioAprobado: 'stps.sonora.gob.mx',          fechaSolicitudAnalisis: '2025-02-01', fechaAplicacionPrueba: '2025-02-05', resultadoPrueba: 'Sin vulnerabilidades críticas'   },
        { folio: 'SOL-2025-002', sectorDependencia: 'ISSSTESON / Salud',              responsableServidor: 'María López', telefonoContacto: '6629876543', correoContacto: 'maria.lopez@isssteson.gob.mx', estatus: 'En proceso', ipServidor: '10.0.1.11', subdominioAprobado: 'expedientes.isssteson.gob.mx', fechaSolicitudAnalisis: '2025-03-10', fechaAplicacionPrueba: '',           resultadoPrueba: 'Pendiente'                       },
      ]);
    }
    return this.http.get<Reporte31Fila[]>(`${this.base}/seguridad/vulnerabilidades`, { params: filtros as any });
  }

  getReporte32(ip: string, filtros: FiltrosReporte): Observable<Reporte32Fila[]> {
    if (environment.useMock) {
      return of([
        { folio: 'SOL-2025-001', sectorDependencia: 'STPS / Secretaría del Trabajo', responsableServidor: 'Juan Pérez', contacto: 'juan.perez@sonora.gob.mx', estatus: 'Activo', ipServidor: '10.0.0.10', subdominioAprobado: 'stps.sonora.gob.mx', tipoDespliegue: 'publicado', puertosSolicitados: '80, 443', reglasFirewall: 'Permitir 80/443 desde internet', integraciones: 'SAP, SIIA', otras: 'Certificado SSL requerido' },
      ]);
    }
    return this.http.get<Reporte32Fila[]>(`${this.base}/seguridad/comunicaciones-por-ip`, { params: { ip, ...filtros } as any });
  }

  // ── 4.x Admin General ──────────────────────────────────────────────────────

  getReporte41(filtros: FiltrosReporte): Observable<Reporte41Fila[]> {
    if (environment.useMock) {
      return of([
        { sector: 'Trabajo',         dependencia: 'STPS',      responsable: 'Juan Pérez',  correo: 'juan.perez@sonora.gob.mx',    descripcionServidor: 'Portal web STPS',             ip: '10.0.0.10', fechaSolicitud: '2025-01-10', estatus: 'En proceso',  fechaProcesamiento: '2025-01-15', rolResponsable: 'Admin Centro de Datos',    fechaPublicacion: '',           tipoDespliegue: 'publicado' },
        { sector: 'Salud',           dependencia: 'ISSSTESON', responsable: 'María López', correo: 'maria.lopez@isssteson.gob.mx', descripcionServidor: 'Sistema expedientes médicos', ip: '10.0.1.11', fechaSolicitud: '2025-01-20', estatus: 'Completado',  fechaProcesamiento: '2025-02-01', rolResponsable: 'Admin Infraestructura',    fechaPublicacion: '2025-02-10', tipoDespliegue: 'interno'   },
        { sector: 'Desarrollo Social', dependencia: 'SEDESSON', responsable: 'Carlos Ruiz', correo: 'carlos.ruiz@sedesson.gob.mx', descripcionServidor: 'Portal de servicios sociales', ip: '10.0.2.12', fechaSolicitud: '2025-02-05', estatus: 'Pendiente', fechaProcesamiento: '2025-02-06', rolResponsable: 'Admin Vulnerabilidades',  fechaPublicacion: '',           tipoDespliegue: 'publicado' },
      ]);
    }
    return this.http.get<Reporte41Fila[]>(`${this.base}/resumen/estatus-solicitudes`, { params: filtros as any });
  }

  getReporte42(filtros: FiltrosReporte): Observable<Reporte42Fila[]> {
    if (environment.useMock) {
      return of(MOCK_SERVIDOR.map(r => ({
        ...r,
        subdominios: `app-${r.folioSolicitud.toLowerCase()}.sonora.gob.mx`,
        vpns: 'VPN-2025-001',
      })));
    }
    return this.http.get<Reporte42Fila[]>(`${this.base}/resumen/recursos-totalizados`, { params: filtros as any });
  }
}
