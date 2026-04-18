import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../dashboard/services/auth.service';
import { ReportesService } from '../../services/reportes.service';
import {
  Reporte11Fila, Reporte12Fila, Reporte13Fila,
  Reporte21Fila, Reporte22Fila,
  Reporte31Fila, Reporte32Fila,
  Reporte41Fila, Reporte42Fila,
} from '../../models/reporte.model';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
})
export class ReportesComponent implements OnInit {
  rol = '';

  fechaDesde = '';
  fechaHasta = '';
  ipFiltro13 = '';
  ipFiltro32 = '';
  filtro42: 'general' | 'dependencia' | 'sistemaOperativo' | 'ip' = 'general';

  datos11: Reporte11Fila[] = [];
  datos12: Reporte12Fila[] = [];
  datos13: Reporte13Fila[] = [];
  datos21: Reporte21Fila[] = [];
  datos22: Reporte22Fila[] = [];
  datos31: Reporte31Fila[] = [];
  datos32: Reporte32Fila[] = [];
  datos41: Reporte41Fila[] = [];
  datos42: Reporte42Fila[] = [];

  constructor(
    private authService: AuthService,
    private reportesService: ReportesService,
  ) {}

  ngOnInit(): void {
    this.rol = this.authService.obtenerUsuario()?.rol ?? '';
    this.cargar();
  }

  get esAdminCD()       { return this.rol === 'admin-cd'; }
  get esAdminInfra()    { return this.rol === 'admin-infraestructura'; }
  get esAdminVuln()     { return this.rol === 'admin-vulnerabilidades'; }
  get esAdminGeneral()  { return this.rol === 'admin-general'; }
  get sinAcceso()       { return !this.esAdminCD && !this.esAdminInfra && !this.esAdminVuln && !this.esAdminGeneral; }

  private get filtros() {
    return { desde: this.fechaDesde, hasta: this.fechaHasta };
  }

  cargar(): void {
    if (this.esAdminCD) {
      this.reportesService.getReporte11(this.filtros).subscribe(d => this.datos11 = d);
      this.reportesService.getReporte12(this.filtros).subscribe(d => this.datos12 = d);
    }
    if (this.esAdminInfra) {
      this.reportesService.getReporte21(this.filtros).subscribe(d => this.datos21 = d);
      this.reportesService.getReporte22(this.filtros).subscribe(d => this.datos22 = d);
    }
    if (this.esAdminVuln) {
      this.reportesService.getReporte31(this.filtros).subscribe(d => this.datos31 = d);
    }
    if (this.esAdminGeneral) {
      this.reportesService.getReporte41(this.filtros).subscribe(d => this.datos41 = d);
      this.reportesService.getReporte42({ ...this.filtros, agrupacion: this.filtro42 }).subscribe(d => this.datos42 = d);
    }
  }

  buscarIP13(): void {
    this.reportesService.getReporte13(this.ipFiltro13, this.filtros).subscribe(d => this.datos13 = d);
  }

  buscarIP32(): void {
    this.reportesService.getReporte32(this.ipFiltro32, this.filtros).subscribe(d => this.datos32 = d);
  }

  get sumaVcpu12()  { return this.datos12.reduce((s, r) => s + r.vcpu, 0); }
  get sumaRam12()   { return this.datos12.reduce((s, r) => s + r.ram, 0); }
  get sumaAlm12()   { return this.datos12.reduce((s, r) => s + r.almacenamiento, 0); }

  get sumaVcpu42()  { return this.datos42.reduce((s, r) => s + r.vcpu, 0); }
  get sumaRam42()   { return this.datos42.reduce((s, r) => s + r.ram, 0); }
  get sumaAlm42()   { return this.datos42.reduce((s, r) => s + r.almacenamiento, 0); }

  badgeClass(estatus: string): string {
    const e = estatus.toLowerCase();
    if (e.includes('complet') || e.includes('activo') || e.includes('aprobad')) return 'badge-completado';
    if (e.includes('proceso') || e.includes('curso'))                            return 'badge-progreso';
    if (e.includes('pendiente'))                                                 return 'badge-pendiente';
    if (e.includes('vencido'))                                                   return 'badge-vencido';
    return 'badge-default';
  }
}
