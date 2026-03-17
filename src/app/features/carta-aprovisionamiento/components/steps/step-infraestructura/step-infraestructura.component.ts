import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PhoneMaskDirective } from '../../../../../shared/directives/phone-mask.directive';

@Component({
  selector: 'app-step-infraestructura',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, PhoneMaskDirective],
  templateUrl: './step-infraestructura.component.html',
  styleUrl: './step-infraestructura.component.scss',
})
export class StepInfraestructuraComponent {
  @Input({ required: true }) form!: FormGroup;

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.touched && ctrl?.hasError(error));
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.touched && ctrl?.invalid);
  }
}
