import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartaService } from '../../services/carta.service';

import { StepContactoComponent } from '../steps/step-contacto/step-contacto.component';
import { StepDescripcionComponent } from '../steps/step-descripcion/step-descripcion.component';
import { StepSpecsComponent } from '../steps/step-specs/step-specs.component';
import { StepInfraestructuraComponent } from '../steps/step-infraestructura/step-infraestructura.component';
import { StepResponsivaComponent } from '../steps/step-responsiva/step-responsiva.component';
import { ConfirmarSolicitudComponent } from '../confirmar-solicitud/confirmar-solicitud.component';
import { HelpPanelComponent } from '../../../../shared/components/help-panel/help-panel.component';
import { AYUDA_PASOS } from '../../../../shared/constants/ayuda-pasos.const';

@Component({
  selector: 'app-carta-stepper',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    StepContactoComponent,
    StepDescripcionComponent,
    StepSpecsComponent,
    StepInfraestructuraComponent,
    StepResponsivaComponent,
    ConfirmarSolicitudComponent,
    HelpPanelComponent,
  ],
  templateUrl: './carta-stepper.component.html',
  styleUrls: ['./carta-stepper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartaStepperComponent implements OnInit, AfterViewInit {

  form!: FormGroup;
  enviando   = false;
  folio:     string | null = null;
  errorEnvio: string | null = null;
  readonly ayudas = AYUDA_PASOS;

  constructor(
    private fb: FormBuilder,
    private cartaService: CartaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.form = this.fb.group({

      // Apartado 1 — Contacto
      areaRequirente: this.fb.group({
        sector:       ['', Validators.required],
        dependencia:  ['', Validators.required],
        responsable:  ['', Validators.required],
        cargo:        ['', Validators.required],
        telefono:     ['', [Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
        correo:       ['', [Validators.required, Validators.email]],
      }),
      adminServidor: this.fb.group({
        proveedor:    ['', Validators.required],
        dependencia:  ['', Validators.required],
        responsable:  ['', Validators.required],
        cargo:        ['', Validators.required],
        telefono:     ['', [Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
        correo:       ['', [Validators.required, Validators.email]],
      }),

      // Apartado 2 — Descripción
      descripcion: this.fb.group({
        descripcionServidor:      ['', Validators.required],
        nombreServidor:           ['', Validators.required],
        fechaArranque:            ['', Validators.required],
        tipoUso:                  ['interno', Validators.required],
        vigencia:                 ['', Validators.required],
        nombreAplicacion:         ['', Validators.required],
        caracteristicasEspeciales: [''],
      }),

      // Apartado 3 — Specs técnicas
      specs: this.fb.group({
        tipoRequerimiento:    ['estandar', Validators.required],
        arquitectura:         ['virtual', Validators.required],
        modalidad:            ['nuevo', Validators.required],
        sistemaOperativo:     ['windows', Validators.required],
        sistemaOperativoOtro: [''],
        vCores:               [2, [Validators.required, Validators.min(1)]],
        memoriaRam:           [4, [Validators.required, Validators.min(1)]],
        almacenamiento:       [50, [Validators.required, Validators.min(1)]],
        motorBD:              [''],
        puertos:              [''],
        integraciones:        [''],
        otrasSpecs:           [''],
        // Campos de renovación
        ipActual:             [''],
        nombreServidorActual: [''],
        tipoRenovacion:       [''],
      }),

      // Apartado 4 — Infraestructura
      infraestructura: this.fb.group({
        subdominioSolicitado: [''],
        puerto:               [''],
        requiereSSL:          [false],
        // Cada entrada VPN es un FormGroup dentro del array
        vpns: this.fb.array([this.crearVpnGroup()]),
      }),

      // Apartado 5 — Responsiva
      responsiva: this.fb.group({
        firmante:       ['', Validators.required],
        numEmpleado:    ['', Validators.required],
        puestoFirmante: ['', Validators.required],
        aceptaTerminos: [false, Validators.requiredTrue],
      }),

    });
  }

  get stepContacto()       { return this.form.get('areaRequirente') as FormGroup; }
  get stepDescripcion()    { return this.form.get('descripcion') as FormGroup; }
  get stepSpecs()          { return this.form.get('specs') as FormGroup; }
  get stepInfra()          { return this.form.get('infraestructura') as FormGroup; }
  get stepResponsiva()     { return this.form.get('responsiva') as FormGroup; }
  get vpnsArray()          { return this.stepInfra.get('vpns') as FormArray; }

  crearVpnGroup(): FormGroup {
    return this.fb.group({
      tipoVpn:           ['dependencia', Validators.required],
      vpnResponsable:    [''],
      vpnCargo:          [''],
      vpnTelefono:       ['', Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)],
      vpnCorreo:         ['', Validators.email],
      vpnPerfilAnterior: [''],
      vpnServidores:     [''],
      vpnId:             [''],
      vpnIp:             [''],
      vpnEmpresa:        [''],
      vpnVigencia:       [''],
    });
  }

  // Convierte cadenas vacías a null para los campos opcionales del backend
  private orNull(val: any): any {
    return val === '' || val === null || val === undefined ? null : val;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.enviando   = true;
    this.errorEnvio = null;

    const v = this.form.value;

    // El formulario usa códigos cortos; el backend espera las etiquetas completas
    const VPN_TIPO: Record<string, string> = {
      dependencia:   'Usuario VPN de dependencia',
      proveedor:     'Usuario VPN para proveedor',
      actualizacion: 'Actualizacion de usuario VPN',
    };

    // Si la modalidad es "renovación" en el form, el backend recibe el tipo
    // de renovación seleccionado (clonacion / serverBase)
    const modalidadPayload = v.specs.modalidad === 'renovacion'
      ? (v.specs.tipoRenovacion || 'clonacion')
      : v.specs.modalidad;

    const payload = {
      areaRequirente: {
        sector:      v.areaRequirente.sector,
        dependencia: v.areaRequirente.dependencia,
        responsable: v.areaRequirente.responsable,
        cargo:       v.areaRequirente.cargo,
        telefono:    v.areaRequirente.telefono,
        correo:      v.areaRequirente.correo,
      },
      adminServidor: {
        proveedor:   v.adminServidor.proveedor,
        dependencia: v.adminServidor.dependencia,
        responsable: v.adminServidor.responsable,
        cargo:       v.adminServidor.cargo,
        telefono:    v.adminServidor.telefono,
        correo:      v.adminServidor.correo,
      },
      descripcion: {
        descripcionServidor:       v.descripcion.descripcionServidor,
        nombreServidor:            v.descripcion.nombreServidor,
        nombreAplicacion:          v.descripcion.nombreAplicacion,
        tipoUso:                   v.descripcion.tipoUso,
        fechaArranque:             v.descripcion.fechaArranque,
        vigencia:                  v.descripcion.vigencia,
        caracteristicasEspeciales: this.orNull(v.descripcion.caracteristicasEspeciales),
      },
      specs: {
        tipoRequerimiento:    v.specs.tipoRequerimiento,
        arquitectura:         v.specs.arquitectura,
        modalidad:            modalidadPayload,
        sistemaOperativo:     v.specs.sistemaOperativo,
        sistemaOperativoOtro: this.orNull(v.specs.sistemaOperativoOtro),
        vCores:               v.specs.vCores,
        memoriaRam:           v.specs.memoriaRam,
        almacenamiento:       v.specs.almacenamiento,
        motorBD:              this.orNull(v.specs.motorBD),
        puertos:              this.orNull(v.specs.puertos),
        integraciones:        this.orNull(v.specs.integraciones),
        otrasSpecs:           this.orNull(v.specs.otrasSpecs),
        ipActual:             this.orNull(v.specs.ipActual),
        nombreServidorActual: this.orNull(v.specs.nombreServidorActual),
        tipoRenovacion:       this.orNull(v.specs.tipoRenovacion),
      },
      infraestructura: {
        subdominioSolicitado: this.orNull(v.infraestructura.subdominioSolicitado),
        puerto:               this.orNull(v.infraestructura.puerto),
        requiereSSL:          v.infraestructura.requiereSSL,
        vpns: (v.infraestructura.vpns as any[]).map(vpn => ({
          tipoVpn:           VPN_TIPO[vpn.tipoVpn] ?? vpn.tipoVpn,
          vpnResponsable:    this.orNull(vpn.vpnResponsable),
          vpnCargo:          this.orNull(vpn.vpnCargo),
          vpnTelefono:       this.orNull(vpn.vpnTelefono),
          vpnCorreo:         this.orNull(vpn.vpnCorreo),
          vpnPerfilAnterior: this.orNull(vpn.vpnPerfilAnterior),
          vpnServidores:     this.orNull(vpn.vpnServidores),
          vpnId:             this.orNull(vpn.vpnId),
          vpnIp:             this.orNull(vpn.vpnIp),
          vpnEmpresa:        this.orNull(vpn.vpnEmpresa),
          vpnVigencia:       this.orNull(vpn.vpnVigencia),
        })),
      },
      responsiva: {
        firmante:       v.responsiva.firmante,
        numEmpleado:    v.responsiva.numEmpleado,
        puestoFirmante: v.responsiva.puestoFirmante,
        aceptaTerminos: v.responsiva.aceptaTerminos,
      },
    };

    this.cartaService.registrarCarta(payload).subscribe({
      next: (cartaRes) => {
        this.enviando = false;
        this.folio    = cartaRes.folio;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.enviando   = false;
        this.errorEnvio = err?.error?.message ?? 'Ocurrió un error al enviar la solicitud. Intenta de nuevo.';
        this.cdr.markForCheck();
      }
    });
  }
}
