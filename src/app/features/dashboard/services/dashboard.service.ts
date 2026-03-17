import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DashboardResponse, Solicitud } from '../models/solicitud.model';
import { environment } from '../../../../environments/environment';
import { DASHBOARD_MOCK } from './dashboard.mock';

export interface DashboardFiltros {
  busqueda?: string;
  estado?: string;
  etapa?: number;
  pagina?: number;
  porPagina?: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private apiUrl = `${environment.apiUrl}/dashboard`;
  private readonly useMock = environment.useMock;

  constructor(private http: HttpClient) {}

  obtenerDashboard(filtros: DashboardFiltros = {}): Observable<DashboardResponse> {
    if (this.useMock) {
      return of(this.filtrarLocal(DASHBOARD_MOCK, filtros));
    }

    let params = new HttpParams();
    if (filtros.busqueda)  params = params.set('busqueda', filtros.busqueda);
    if (filtros.estado)    params = params.set('estado', filtros.estado);
    if (filtros.etapa)     params = params.set('etapa', filtros.etapa.toString());
    if (filtros.pagina)    params = params.set('pagina', filtros.pagina.toString());
    if (filtros.porPagina) params = params.set('porPagina', filtros.porPagina.toString());
    return this.http.get<DashboardResponse>(this.apiUrl, { params });
  }

  obtenerDetalle(id: string): Observable<Solicitud> {
    if (this.useMock) {
      return of(DASHBOARD_MOCK.solicitudes.find(s => s.id === id)!);
    }
    return this.http.get<Solicitud>(`${this.apiUrl}/${id}`);
  }

  private filtrarLocal(data: DashboardResponse, filtros: DashboardFiltros): DashboardResponse {
    let solicitudes = data.solicitudes;

    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase();
      solicitudes = solicitudes.filter(s =>
        s.folio.toLowerCase().includes(q) || s.dependencia.toLowerCase().includes(q)
      );
    }
    if (filtros.estado) {
      solicitudes = solicitudes.filter(s => s.estado === filtros.estado);
    }
    if (filtros.etapa) {
      solicitudes = solicitudes.filter(s => s.etapaActual === filtros.etapa);
    }

    const metricas = {
      total:      solicitudes.length,
      enProgreso: solicitudes.filter(s => s.estado === 'en-progreso').length,
      pendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
      completadas: solicitudes.filter(s => s.estado === 'completada').length,
    };

    return { solicitudes, metricas };
  }
}
