import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-system-component',
  templateUrl: './system-component.html',
  styleUrls: ['./system-component.scss'],
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, RouterModule]
})
export class SystemComponent {

}
