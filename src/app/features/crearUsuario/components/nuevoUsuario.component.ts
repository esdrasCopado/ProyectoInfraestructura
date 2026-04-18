
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ROL_MAP, RolUsuario } from '../../dashboard/services/auth.service';
@Component({
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevoUsuario.component.html',
  styleUrls: ['./nuevoUsuario.component.scss'],
  standalone: true,
  imports: [FormsModule]
})
export class NuevoUsuarioComponent {
  roles = Object.keys(ROL_MAP);  // ['administrador_general', 'dependencia_cliente', ...]
}
