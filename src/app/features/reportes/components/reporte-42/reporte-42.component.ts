import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ReportesService } from '../../services/reportes.service';
import { EstatusBadgePipe } from '../../../../shared/pipes/estatus-badge.pipe';
import { Reporte42Fila } from '../../models/reporte.model';

@Component({
  selector: 'app-reporte-42',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatSelectModule, EstatusBadgePipe],
  templateUrl: './reporte-42.component.html',
  styleUrl: './reporte-42.component.scss',
})
export class Reporte42Component implements OnInit {
  fechaDesde = '';
  fechaHasta = '';
  agrupacion: 'general' | 'dependencia' | 'sistemaOperativo' | 'ip' = 'general';
  datos: Reporte42Fila[] = [];

  constructor(private svc: ReportesService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.svc.getReporte42({ fechaInicio: this.fechaDesde, fechaFin: this.fechaHasta, agrupacion: this.agrupacion })
      .subscribe(d => this.datos = d);
  }

  limpiar(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.agrupacion = 'general';
    this.cargar();
  }

  get sumaVcpu() { return this.datos.reduce((s, r) => s + r.vcpu, 0); }
  get sumaRam()  { return this.datos.reduce((s, r) => s + r.ram, 0); }
  get sumaAlm()  { return this.datos.reduce((s, r) => s + r.almacenamiento, 0); }
}
