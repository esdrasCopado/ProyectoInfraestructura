import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-step-specs',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule],
  templateUrl: './step-specs.component.html',
  styleUrl: './step-specs.component.scss',
})
export class StepSpecsComponent implements OnInit, OnDestroy {
  @Input({ required: true }) form!: FormGroup;

  private sub = new Subscription();

  get sistemaOperativo() { return this.form.get('sistemaOperativo')?.value; }
  get esEstandar()       { return this.form.get('tipoRequerimiento')?.value === 'estandar'; }
  get esRenovacion()     { return this.form.get('modalidad')?.value === 'renovacion'; }

  ngOnInit(): void {
    // Al cambiar a estándar: resetear recursos a los valores fijos
    this.sub.add(
      this.form.get('tipoRequerimiento')!.valueChanges.subscribe(val => {
        if (val === 'estandar') {
          this.form.patchValue({ vCores: 2, memoriaRam: 4, almacenamiento: 50 });
        }
      })
    );
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.touched && ctrl?.hasError(error));
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.touched && ctrl?.invalid);
  }
}
