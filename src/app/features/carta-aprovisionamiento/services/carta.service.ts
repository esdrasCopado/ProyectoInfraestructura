import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CartaAprovisionamiento } from '../models/carta-aprovisionamiento.model';
import { VpnDisponible } from '../components/steps/step-infraestructura/step-infraestructura.component';
import { AuthService } from '../../dashboard/services/auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartaService {

  private apiUrl      = `${environment.apiUrl}/cartas`;
  private solicitudUrl = `${environment.apiUrl}/solicitud/completa`;
  private vpnUrl       = `${environment.apiUrl}/vpn`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  crearSolicitudCompleta(payload: object): Observable<{ folio: string }> {
    return this.http.post<{ folio: string }>(this.solicitudUrl, payload);
  }

  obtenerIdUsuario(): number | null {
    const id = this.authService.obtenerUsuario()?.id;
    const parsed = parseInt(id ?? '', 10);
    return isNaN(parsed) ? null : parsed;
  }

  obtenerCarta(id: string): Observable<CartaAprovisionamiento> {
    return this.http.get<CartaAprovisionamiento>(`${this.apiUrl}/${id}`);
  }

  // CA-01: listado de VPNs del usuario actual
  obtenerVpnsUsuario(): Observable<VpnDisponible[]> {
    if (environment.useMock) {
      return of([
        { folio: 'VPN-2025-001', tipo: 'Usuario VPN de dependencia',   ip: '10.0.0.10' },
        { folio: 'VPN-2025-002', tipo: 'Usuario VPN para proveedor',   ip: '10.0.0.11' },
        { folio: 'VPN-2025-003', tipo: 'Actualizacion de usuario VPN', ip: '10.0.0.12' },
      ]);
    }
    const idUsuario = this.authService.obtenerUsuario()?.id;
    return this.http.get<VpnDisponible[]>(this.vpnUrl, {
      params: { idUsuario: idUsuario ?? '' },
    });
  }

  buscarVpnsPorFolio(folio: string): Observable<VpnDisponible[]> {
    if (environment.useMock) {
      const term = folio.toLowerCase().trim();
      const mock: VpnDisponible[] = [
        { folio: 'SOL-2025-001', tipo: 'Usuario VPN de dependencia',   ip: '10.0.0.10' },
        { folio: 'SOL-2025-002', tipo: 'Usuario VPN para proveedor',   ip: '10.0.0.11' },
        { folio: 'SOL-2025-003', tipo: 'Actualizacion de usuario VPN', ip: '10.0.0.12' },
      ];
      return of(term ? mock.filter(v => v.folio.toLowerCase().includes(term)) : []);
    }
    const idUsuario = this.obtenerIdUsuario();
    return this.http.get<VpnDisponible[]>(
      `${this.vpnUrl}/folio/${encodeURIComponent(folio)}`,
      { params: { ...(idUsuario != null ? { idUsuario: String(idUsuario) } : {}) } }
    );
  }

  agregarFolioVpn(folio: string): Observable<VpnDisponible> {
    if (environment.useMock) {
      return of({ folio, tipo: 'Usuario VPN de dependencia' });
    }
    const idUsuario = this.obtenerIdUsuario();
    return this.http.post<VpnDisponible>(this.vpnUrl, { folio, idUsuario });
  }
}
