import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './pages/errors/page-not-found/page-not-found.component';
import { canActivateAuthRole } from './guard/auth.guard';
import { App } from './app';
import { Logout } from './shared/authentication/logout/logout';

export const routes: Routes = [
    {
        path: 'system', 
        loadChildren: () => import('./pages/system/system-module-module').then(m => m.SystemModuleModule),
        canActivate: [canActivateAuthRole]
    },
    {path: 'authentication/logout', component: Logout},
    {path: '', component: App, pathMatch: 'full'},
    {path: '404', component: PageNotFoundComponent},
    {path: '**', redirectTo:'/404'},
];
