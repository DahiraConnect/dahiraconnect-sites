import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { TenantService } from '../../../core/tenant/tenant.service';
import { AdminAuth } from '../core/admin-auth.service';
import { ADMIN_MODULES } from '../core/modules';
import { PublishService } from '../core/publish.service';

/**
 * Coquille du back-office : bouton Menu (grille des modules, comme Odoo), avatar (profil, site,
 * déconnexion), page, message d'enregistrement.
 */
@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss',
  // Styles communs (formulaires, listes) partagés par toutes les pages admin
  encapsulation: ViewEncapsulation.None,
  host: {
    '(document:keydown.escape)': 'closeAll()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminShell {
  private readonly router = inject(Router);
  protected readonly auth = inject(AdminAuth);
  protected readonly notice = inject(PublishService).notice;
  private readonly site = inject(TenantService).dahira;

  protected readonly menuOpen = signal(false);
  protected readonly userOpen = signal(false);

  protected readonly name = computed(() => this.auth.current()?.profile.shortName ?? this.site().shortName);
  protected readonly logo = computed(() => this.site().logoSmallUrl ?? this.site().logoUrl);
  protected readonly initial = computed(() => this.auth.displayName().charAt(0).toUpperCase() || '?');
  protected readonly roleLabel = computed(() => (this.auth.current()?.role === 'owner' ? 'Propriétaire' : 'Éditeur'));
  protected readonly modules = computed(() =>
    ADMIN_MODULES.filter((m) => !m.ownerOnly || this.auth.current()?.role === 'owner'),
  );

  constructor() {
    // Changement de page : les menus se ferment
    this.router.events
      .pipe(filter((e) => e instanceof NavigationStart), takeUntilDestroyed())
      .subscribe(() => this.closeAll());
  }

  protected toggleMenu(): void {
    this.userOpen.set(false);
    this.menuOpen.update((v) => !v);
  }

  protected toggleUser(): void {
    this.menuOpen.set(false);
    this.userOpen.update((v) => !v);
  }

  protected closeAll(): void {
    this.menuOpen.set(false);
    this.userOpen.set(false);
  }

  protected async signOut(): Promise<void> {
    this.closeAll();
    await this.auth.signOut();
    await this.router.navigateByUrl('/admin/connexion');
  }
}
