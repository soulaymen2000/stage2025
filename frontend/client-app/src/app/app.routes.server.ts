import { RenderMode, ServerRoute } from '@angular/ssr';

// Use Client render mode for wildcard route to avoid prerendering parameterized routes
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
