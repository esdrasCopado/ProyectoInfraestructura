import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService, RolUsuario } from '../../services/auth.service';
import { Solicitud, EstadoEtapa } from '../../models/solicitud.model';

@Component({
  selector: 'app-expediente-detalle',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './expediente-detalle.component.html',
  styleUrl: './expediente-detalle.component.scss'
})
export class ExpedienteDetalleComponent implements OnInit {

  solicitud?: Solicitud;
  cargando = true;
  error = false;
  guardando = false;

  rolUsuario: RolUsuario | null = null;
  panelForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.rolUsuario = this.authService.obtenerRol();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.cargarExpediente(id);
  }

  private cargarExpediente(id: string): void {
    this.cargando = true;
    this.dashboardService.obtenerDetalle(id).subscribe({
      next: (data) => {
        this.solicitud = data;
        this.cargando = false;
        this.inicializarPanel();
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = true;
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private inicializarPanel(): void {
    const etapa = this.solicitud?.etapaActual;

    switch (etapa) {
      case 2:
        this.panelForm = this.fb.group({
          vCores:        [this.solicitud?.etapas[1]?.vCores ?? 2, Validators.required],
          memoriaRam:    [this.solicitud?.etapas[1]?.memoriaRam ?? 4, Validators.required],
          almacenamiento:[this.solicitud?.etapas[1]?.almacenamiento ?? 50, Validators.required],
          ip:            ['', Validators.required],
        });
        break;

      case 5:
        this.panelForm = this.fb.group({
          tipoVpn:     ['proveedor', Validators.required],
          vigencia:    ['30', Validators.required],
          responsable: ['', Validators.required],
          correo:      ['', [Validators.required, Validators.email]],
        });
        break;

      case 6:
        this.panelForm = this.fb.group({
          subdominioSolicitado: ['', Validators.required],
          puerto:               [''],
          requiereSSL:          [false],
        });
        break;

      default:
        this.panelForm = this.fb.group({});
    }
  }

  get puedeActuar(): boolean {
    const etapa = this.solicitud?.etapaActual;
    const rol = this.rolUsuario;
    if (!etapa || !rol) return false;

    const permisos: Record<number, RolUsuario[]> = {
      1:  ['dependencia', 'admin-cd'],
      2:  ['admin-cd'],
      3:  ['admin-cd'],
      4:  ['admin-cd'],
      5:  ['admin-infraestructura'],
      6:  ['admin-infraestructura'],
      7:  ['admin-cd'],
      8:  ['dependencia'],
      9:  ['admin-cd', 'admin-infraestructura'],
      10: ['dependencia'],
      11: ['admin-vulnerabilidades'],
    };

    return permisos[etapa]?.includes(rol) ?? false;
  }

  get etapaActualNombre(): string {
    const etapa = this.solicitud?.etapaActual;
    if (!etapa || !this.solicitud) return '';
    return this.solicitud.etapas[etapa - 1]?.nombre ?? '';
  }

  claseEstado(estado: EstadoEtapa): string {
    const clases: Record<EstadoEtapa, string> = {
      'completada':          'dot-done',
      'en-curso':            'dot-active',
      'pendiente-respuesta': 'dot-waiting',
      'sin-iniciar':         'dot-pending'
    };
    return clases[estado];
  }

  onGuardar(): void {
    if (this.panelForm.invalid || !this.solicitud) return;
    this.guardando = true;
    console.log('Guardando etapa', this.solicitud.etapaActual, this.panelForm.value);
  }
}
