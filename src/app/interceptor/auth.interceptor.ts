import { provideRouter } from '@angular/router';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideKeycloak,
  createInterceptorCondition,
  IncludeBearerTokenCondition,
  includeBearerTokenInterceptor,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG
} from 'keycloak-angular';
import { routes } from '../app.routes';
import { environment } from '../enviroments/environment';


// Build a safe RegExp from the configured server value. Prefer `environment.server` but
// fall back to `environment.serverUrl` for backwards compatibility.
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const apiBase = (environment as any).server;
const urlPattern = apiBase
  ? new RegExp(`^${escapeRegExp(apiBase)}(\/api(\/.*)?)?$`, 'i')
  : /^(http:\/\/localhost:8181)(\/.*)?$/i;

const urlCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern,
  bearerPrefix: 'Bearer'
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloak({
      config: {
        url: 'keycloak-server-url',
        realm: 'realm-id',
        clientId: 'client-id'
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
      }
    }),
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [urlCondition] // <-- Note that multiple conditions might be added.
    },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor]))
  ]
};