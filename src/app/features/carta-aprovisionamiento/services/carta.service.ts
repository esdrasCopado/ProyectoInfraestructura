import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartaAprovisionamiento } from '../models/carta-aprovisionamiento.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartaService {

  private apiUrl    = `${environment.apiUrl}/cartas`;
  private solicitudUrl = `${environment.apiUrl}/solicitud`;

  constructor(private http: HttpClient) {}

  registrarCarta(carta: object): Observable<{ folio: string }> {
    return this.http.post<{ folio: string }>(this.apiUrl, carta);
  }

  registrarSolicitud(solicitud: object): Observable<any> {
    return this.http.post<any>(this.solicitudUrl, solicitud);
  }

  obtenerCarta(id: string): Observable<CartaAprovisionamiento> {
    return this.http.get<CartaAprovisionamiento>(`${this.apiUrl}/${id}`);
  }
}
