import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReportesService } from '../../services/reportes.service';
import { EstatusBadgePipe } from '../../../../shared/pipes/estatus-badge.pipe';
import { Reporte31Fila } from '../../models/reporte.model';

@Component({
  selector: 'app-reporte-31',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, EstatusBadgePipe],
  templateUrl: './reporte-31.component.html',
  styleUrl: './reporte-31.component.scss',
})
export class Reporte31Component implements OnInit {
  fechaDesde = '';
  fechaHasta = '';
  datos: Reporte31Fila[] = [];

  constructor(private svc: ReportesService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.svc.getReporte31({ desde: this.fechaDesde, hasta: this.fechaHasta })
      .subscribe(d => this.datos = d);
  }

  limpiar(): void { this.fechaDesde = ''; this.fechaHasta = ''; this.cargar(); }
}
