import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { PageNotFoundComponent } from './pages/errors/page-not-found/page-not-found.component';

export const routes: Routes = [
    {path: '', redirectTo: 'authentication/login', pathMatch: 'full'},
    {path: 'authentication/logout', pathMatch: 'full', component: LogoutComponent },
    {path: 'authentication/login', pathMatch: 'full', component:LoginComponent},
    {path: '404', component: PageNotFoundComponent},
    {path: '**', redirectTo:'/404'},
];
