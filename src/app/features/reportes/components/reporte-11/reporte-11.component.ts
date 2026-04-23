import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReportesService } from '../../services/reportes.service';
import { EstatusBadgePipe } from '../../../../shared/pipes/estatus-badge.pipe';
import { Reporte11Fila } from '../../models/reporte.model';

@Component({
  selector: 'app-reporte-11',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, EstatusBadgePipe],
  templateUrl: './reporte-11.component.html',
  styleUrl: './reporte-11.component.scss',
})
export class Reporte11Component implements OnInit {
  fechaDesde = '';
  fechaHasta = '';
  datos: Reporte11Fila[] = [];

  constructor(private svc: ReportesService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.svc.getReporte11({ fechaInicio: this.fechaDesde, fechaFin: this.fechaHasta })
      .subscribe(d => this.datos = d);
  }

  limpiar(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.cargar();
  }
}
