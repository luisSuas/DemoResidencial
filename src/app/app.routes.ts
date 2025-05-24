import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { AuthGuard, customClaims } from '@angular/fire/auth-guard';
import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';
import { Role } from 'src/interfaces/User.model';

const redirecToRoleOrLogin = (next: ActivatedRouteSnapshot) => pipe(customClaims, map(
  (claims: any) => {
    console.log(claims)
    if (next.data['role'] === claims['role'])
      return true
    else if (claims['role'])
      return [claims['role']]
    else
      return ['login']
  })
);


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full',
  },
  {
    path: 'login',
    title: "Inicio de sesión",
    canActivate: [
      AuthGuard,
    ],
    data: {
      authGuardPipe: redirecToRoleOrLogin
    },
    loadComponent: () => import('./views/login/login.page').then(m => m.LoginPage)
  },
  {
    path: Role.ADMIN,
    canActivate: [
      AuthGuard,
    ],
    data: {
      role: Role.ADMIN,
      authGuardPipe: redirecToRoleOrLogin
    },
    loadChildren: () => import('./views/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  }
];
