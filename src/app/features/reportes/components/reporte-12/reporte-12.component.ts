import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReportesService } from '../../services/reportes.service';
import { EstatusBadgePipe } from '../../../../shared/pipes/estatus-badge.pipe';
import { Reporte12Fila } from '../../models/reporte.model';

@Component({
  selector: 'app-reporte-12',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, EstatusBadgePipe],
  templateUrl: './reporte-12.component.html',
  styleUrl: './reporte-12.component.scss',
})
export class Reporte12Component implements OnInit {
  fechaDesde = '';
  fechaHasta = '';
  datos: Reporte12Fila[] = [];
  sumaVcpu = 0;
  sumaRam = 0;
  sumaAlm = 0;

  constructor(private svc: ReportesService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.svc.getReporte12({ fechaInicio: this.fechaDesde, fechaFin: this.fechaHasta })
      .subscribe(res => {
        const r = res as any;
        this.datos    = Array.isArray(r) ? r : (r?.items ?? []);
        this.sumaVcpu = r?.totalVcpu          ?? 0;
        this.sumaRam  = r?.totalRam           ?? 0;
        this.sumaAlm  = r?.totalAlmacenamiento ?? 0;
      });
  }

  limpiar(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.cargar();
  }
}
