import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  ],
  templateUrl: './carta-stepper.component.html',
  styleUrls: ['./carta-stepper.component.scss']
})
export class CartaStepperComponent implements OnInit {

  form!: FormGroup;
  enviando = false;

  constructor(private fb: FormBuilder, private cartaService: CartaService) {}

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
        tipoRequerimiento: ['estandar', Validators.required],
        modalidad:         ['nuevo', Validators.required],
        sistemaOperativo:  ['windows', Validators.required],
        sistemaOperativoOtro: [''],
        vCores:            [2, [Validators.required, Validators.min(1)]],
        memoriaRam:        [4, [Validators.required, Validators.min(1)]],
        almacenamiento:    [50, [Validators.required, Validators.min(1)]],
        motorBD:           [''],
        puertos:           [''],
        integraciones:     [''],
        otrasSpecs:        [''],
      }),

      // Apartado 4 — Infraestructura
      infraestructura: this.fb.group({
        subdominioSolicitado: [''],
        puerto:               [''],
        requiereSSL:          [false],
        vpnResponsable:       ['', Validators.required],
        vpnCargo:             ['', Validators.required],
        vpnTelefono:          ['', [Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
        vpnCorreo:            ['', [Validators.required, Validators.email]],
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

  onSubmit(): void {
    if (this.form.invalid) return;
    this.enviando = true;
    this.cartaService.registrarCarta(this.form.value).subscribe({
      next: () => {
        this.enviando = false;
      },
      error: () => {
        this.enviando = false;
      }
    });
  }
}
