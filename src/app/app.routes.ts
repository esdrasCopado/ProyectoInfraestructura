import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/components/dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'carta-aprovisionamiento',
    loadComponent: () =>
      import('./features/carta-aprovisionamiento/components/carta-stepper/carta-stepper.component')
        .then(m => m.CartaStepperComponent),
    canActivate: [authGuard]
  },
  {
    path: 'expediente/:id',
    loadComponent: () =>
      import('./features/dashboard/components/expediente-detalle/expediente-detalle.component')
        .then(m => m.ExpedienteDetalleComponent),
    canActivate: [authGuard]
  },
  {
    path: 'crear-usuario',
    loadComponent: () =>
      import('./features/crearUsuario/components/nuevoUsuario.component')
        .then(m => m.NuevoUsuarioComponent),
    canActivate: [authGuard]
  },
  {
    path: 'perfil-usuario',
    loadComponent: () =>
      import('./features/perfilUsuario/components/perfilUsuario.component')
        .then(m => m.PerfilUsuarioComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
