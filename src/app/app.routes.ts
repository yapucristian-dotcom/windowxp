import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { Desktop } from './layout/desktop/desktop';

export const routes: Routes = [
  {
    path: '',
    component: Desktop,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'app/dashboard' },
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/autenticacion/login').then((module) => module.Login),
      },
      {
        path: 'app',
        canActivate: [authGuard],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
          {
            path: 'dashboard',
            loadComponent: () => import('./features/dashboard/dashboard').then((module) => module.Dashboard),
          },
          {
            path: 'usuarios',
            loadComponent: () => import('./features/usuarios/usuarios').then((module) => module.Usuarios),
          },
          {
            path: 'usuarios/nuevo',
            loadComponent: () =>
              import('./features/usuarios/usuario-form').then((module) => module.UsuarioForm),
          },
          {
            path: 'usuarios/editar/:id',
            loadComponent: () =>
              import('./features/usuarios/usuario-form').then((module) => module.UsuarioForm),
          },
          {
            path: 'reportes',
            loadComponent: () => import('./features/reportes/reportes').then((module) => module.Reportes),
          },
          {
            path: 'configuracion',
            loadComponent: () =>
              import('./features/configuracion/configuracion').then((module) => module.Configuracion),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
