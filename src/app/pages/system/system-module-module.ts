import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemComponent } from './system-component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import { Home } from './home/home';

const routes = [{
  path: '',
  component: SystemComponent,
  canActivate: [],
  children: [
    {
      component: Home,
      path: 'home',
    }
  ]
}];

@NgModule({
  imports: [
    CommonModule,
    SystemComponent,
    NavbarComponent,
    SidebarComponent,
    RouterModule.forChild(routes)
  ]
})
export class SystemModuleModule { }
