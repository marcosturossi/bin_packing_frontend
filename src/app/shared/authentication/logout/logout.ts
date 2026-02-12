import { Component, inject } from '@angular/core';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.html',
  styleUrl: './logout.scss',
})
export class Logout {
  constructor() {
    const kc = inject(Keycloak as unknown as any) as any;
    try {
      if (kc && typeof kc.logout === 'function') {
        kc.logout({ redirectUri: window.location.origin });
      }
    } catch {
      // best-effort fallback
      window.location.href = window.location.origin;
    }
  }

}
