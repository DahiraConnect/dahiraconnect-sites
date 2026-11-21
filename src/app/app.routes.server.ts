import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Rendu serveur à la requête : le dahira dépend du sous-domaine,
 * un prérendu au build ne servirait qu'un seul dahira.
 */
export const serverRoutes: ServerRoute[] = [{ path: '**', renderMode: RenderMode.Server }];
