import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { privateGuard, publicGuard } from './shared/guards/auth.guard';
import { AuthSignupComponent } from './components/auth/signup/signup.component';
import { DespesaComponent } from './components/despesa/despesa.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
    {
        path: 'login',
        canActivate: [publicGuard],
        component: LoginComponent,
      },
      {
        path: 'signup',
        canActivate: [publicGuard],
        component: AuthSignupComponent,
      },
      {
        path: '',
        canActivate: [privateGuard],
        component: DespesaComponent,
      },
      {
        path: 'dashboard',
        canActivate: [privateGuard],
        component: DashboardComponent,
      },
];
