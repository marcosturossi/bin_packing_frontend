import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../layout/sidebar.service';
import { ThemeService } from '../theme.service';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [CommonModule, MenubarModule, ButtonModule, MenuModule],
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  userName:string|null = ""
  profileDropDown = false
  sidebarOpen = false
  profileItems: any[] = []

  constructor(
    private router:Router,
    private sidebarService: SidebarService,
    private themeService: ThemeService,
  ){
  }
  private readonly keycloak = inject(Keycloak as unknown as any) as any;
  ngOnInit(): void {
    this.setUserName()
    this.profileItems = [
      { label: 'Sair', icon: 'pi pi-sign-out', command: () => this.logout() }
    ];

    // subscribe to sidebar state
    this.sidebarService.open$.subscribe(open => this.sidebarOpen = open);
  }
  
  checkSidebarState() {
    // Check if sidebar is open by looking at body class
    const observer = new MutationObserver(() => {
      this.sidebarOpen = document.body.classList.contains('sidebar-open');
    });
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  setUserName(){
    try {
      // Try to read username from the Keycloak token if available
      this.userName = (this.keycloak?.tokenParsed?.preferred_username as string) ?? null;
    } catch {
      this.userName = null;
    }
  }

  openProfileDropDown(){
    this.profileDropDown = !this.profileDropDown
  }

  toggleSidebar(){
    // Toggle via SidebarService (shared state)
    this.sidebarService.toggle();
  }

  logout(){
    this.router.navigateByUrl("authentication/logout")
  }

  toggleTheme(){
    this.themeService.toggle();
  }

}
