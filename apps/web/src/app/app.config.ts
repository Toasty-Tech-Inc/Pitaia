import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideEventPlugins } from '@taiga-ui/event-plugins';
import { NG_EVENT_PLUGINS } from '@taiga-ui/event-plugins';
import { tuiIconResolverProvider } from '@taiga-ui/core';
import { appRoutes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes, withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideEventPlugins(),
    NG_EVENT_PLUGINS,
    tuiIconResolverProvider((name: string) => {
      // Remove o prefixo @tui. se existir
      const iconName = name.startsWith('@tui.') ? name.slice(5) : name;
      return `assets/taiga-ui/icons/${iconName}.svg`;
    }),
  ],
};
