import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuth } from './admin-auth.service';

/** Paramètres du dahira : propriétaires uniquement */
export const ownerGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const auth = inject(AdminAuth);
  await auth.init();
  return auth.current()?.role === 'owner' ? true : router.parseUrl('/admin');
};
