import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReportesService } from '../../services/reportes.service';
import { EstatusBadgePipe } from '../../../../shared/pipes/estatus-badge.pipe';
import { Reporte21Fila } from '../../models/reporte.model';

@Component({
  selector: 'app-reporte-21',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, EstatusBadgePipe],
  templateUrl: './reporte-21.component.html',
  styleUrl: './reporte-21.component.scss',
})
export class Reporte21Component implements OnInit {
  fechaDesde = '';
  fechaHasta = '';
  datos: Reporte21Fila[] = [];

  constructor(private svc: ReportesService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.svc.getReporte21({ desde: this.fechaDesde, hasta: this.fechaHasta })
      .subscribe(d => this.datos = d);
  }

  limpiar(): void { this.fechaDesde = ''; this.fechaHasta = ''; this.cargar(); }
}
