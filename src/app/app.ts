import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from './shared/theme.service';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('bin_packing');
  protected isHome = false;
  constructor(private themeService: ThemeService, private router: Router) {
    this.themeService.init();
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(ev => {
      // mark container as fluid when on home route path
      this.isHome = ev.urlAfterRedirects.startsWith('/system/home') || ev.urlAfterRedirects === '/' || ev.urlAfterRedirects === '/home';
    });
  }
}
