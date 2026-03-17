import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/components/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'carta-aprovisionamiento',
    loadComponent: () =>
      import('./features/carta-aprovisionamiento/components/carta-stepper/carta-stepper.component')
        .then(m => m.CartaStepperComponent)
  },
  {
    path: '',
    redirectTo: 'carta-aprovisionamiento',
    pathMatch: 'full'
  }
];
