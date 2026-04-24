import { Routes } from '@angular/router';
import { Registro } from './components/registro/registro';
import { Lista } from './components/lista/lista';
import { Tv } from './components/tv/tv';
import { Dashboard } from './components/dashboard/dashboard';
import { authGuard } from './auth-guard';
import { Login } from './components/login/login';


export const routes: Routes = [
{path: 'registro' , component: Registro},
{path: '', redirectTo: 'registro', pathMatch: 'full'},
{path: 'lista' , component: Lista},
{path:  'tv' , component:   Tv},
{path:  'dashboard' , component: Dashboard,
canActivate: [authGuard]
},
{path: 'login' , component: Login},
];
