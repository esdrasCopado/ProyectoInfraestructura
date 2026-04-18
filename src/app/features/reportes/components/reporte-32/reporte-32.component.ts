import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReportesService } from '../../services/reportes.service';
import { EstatusBadgePipe } from '../../../../shared/pipes/estatus-badge.pipe';
import { Reporte32Fila } from '../../models/reporte.model';

@Component({
  selector: 'app-reporte-32',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, EstatusBadgePipe],
  templateUrl: './reporte-32.component.html',
  styleUrl: './reporte-32.component.scss',
})
export class Reporte32Component {
  fechaDesde = '';
  fechaHasta = '';
  ip = '';
  datos: Reporte32Fila[] = [];

  constructor(private svc: ReportesService) {}

  buscar(): void {
    this.svc.getReporte32(this.ip, { desde: this.fechaDesde, hasta: this.fechaHasta })
      .subscribe(d => this.datos = d);
  }

  limpiar(): void { this.ip = ''; this.fechaDesde = ''; this.fechaHasta = ''; this.datos = []; }
}
