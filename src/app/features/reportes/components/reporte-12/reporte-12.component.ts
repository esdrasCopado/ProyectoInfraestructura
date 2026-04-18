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

  constructor(private svc: ReportesService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.svc.getReporte12({ desde: this.fechaDesde, hasta: this.fechaHasta })
      .subscribe(d => this.datos = d);
  }

  limpiar(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.cargar();
  }

  get sumaVcpu()  { return this.datos.reduce((s, r) => s + r.vcpu, 0); }
  get sumaRam()   { return this.datos.reduce((s, r) => s + r.ram, 0); }
  get sumaAlm()   { return this.datos.reduce((s, r) => s + r.almacenamiento, 0); }
}
