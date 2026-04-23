import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReportesService } from '../../services/reportes.service';
import { EstatusBadgePipe } from '../../../../shared/pipes/estatus-badge.pipe';
import { Reporte41Fila } from '../../models/reporte.model';

@Component({
  selector: 'app-reporte-41',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, EstatusBadgePipe],
  templateUrl: './reporte-41.component.html',
  styleUrl: './reporte-41.component.scss',
})
export class Reporte41Component implements OnInit {
  fechaDesde = '';
  fechaHasta = '';
  datos: Reporte41Fila[] = [];

  constructor(private svc: ReportesService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.svc.getReporte41({ fechaInicio: this.fechaDesde, fechaFin: this.fechaHasta })
      .subscribe(d => this.datos = d);
  }

  limpiar(): void { this.fechaDesde = ''; this.fechaHasta = ''; this.cargar(); }
}
