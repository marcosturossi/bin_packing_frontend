import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { PanelMenuModule } from 'primeng/panelmenu';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../layout/sidebar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: true,
  imports: [RouterModule, DrawerModule, PanelMenuModule, CommonModule],
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

  visible = false;
  items: any[] = [];
  sub?: Subscription;

  constructor(private router: Router, private sidebarService: SidebarService) { }

  ngOnInit(): void {
    this.items = [
      { label: 'Home', icon: 'pi pi-home', routerLink: ['/system/home'] },
      { label: 'Alunos', icon: 'pi pi-user', routerLink: ['/system/students'] },
    ];

    this.sub = this.sidebarService.open$.subscribe(v => this.visible = v);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onHide() {
    this.sidebarService.close();
  }

}
