import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuth } from '../core/admin-auth.service';
import { supabaseConfigured } from '../core/supabase';

/** « Se déconnecter » depuis le site public : ferme la session puis revient à l'accueil du site. */
@Component({
  selector: 'app-admin-logout',
  template: `<p class="adm-page adm-lead" aria-live="polite">Déconnexion…</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LogoutPage {
  constructor() {
    const auth = inject(AdminAuth);
    const router = inject(Router);
    void (async () => {
      if (supabaseConfigured) {
        await auth.init();
        await auth.signOut().catch(() => undefined);
      }
      await router.navigateByUrl('/');
    })();
  }
}
