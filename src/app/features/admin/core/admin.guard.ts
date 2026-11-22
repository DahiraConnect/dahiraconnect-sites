import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuth } from './admin-auth.service';
import { supabaseConfigured } from './supabase';

/** Pages du back-office : connexion obligatoire */
export const adminGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const auth = inject(AdminAuth);
  if (!supabaseConfigured) return router.parseUrl('/admin/connexion');
  await auth.init();
  return auth.session() ? true : router.parseUrl('/admin/connexion');
};

/** Page de connexion : inutile si déjà connecté */
export const guestGuard: CanActivateFn = async () => {
  if (!supabaseConfigured) return true;
  // inject() uniquement avant le premier await (contexte d'injection)
  const router = inject(Router);
  const auth = inject(AdminAuth);
  await auth.init();
  return auth.session() ? router.parseUrl('/admin') : true;
};
