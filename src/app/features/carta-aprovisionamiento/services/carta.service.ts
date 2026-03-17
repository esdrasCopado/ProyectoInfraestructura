import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartaAprovisionamiento } from '../models/carta-aprovisionamiento.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartaService {

  private apiUrl = `${environment.apiUrl}/cartas`;

  constructor(private http: HttpClient) {}

  registrarCarta(carta: CartaAprovisionamiento): Observable<{ folio: string }> {
    return this.http.post<{ folio: string }>(this.apiUrl, carta);
  }

  obtenerCarta(id: string): Observable<CartaAprovisionamiento> {
    return this.http.get<CartaAprovisionamiento>(`${this.apiUrl}/${id}`);
  }
}
