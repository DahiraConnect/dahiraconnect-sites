import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TenantService } from '../../../core/tenant/tenant.service';
import { AdminAuth } from '../core/admin-auth.service';
import { PublishService } from '../core/publish.service';

/** Coquille du back-office : barre du haut, page, message d'enregistrement. */
@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss',
  // Styles communs (formulaires, listes) partagés par toutes les pages admin
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminShell {
  private readonly router = inject(Router);
  protected readonly auth = inject(AdminAuth);
  protected readonly notice = inject(PublishService).notice;
  private readonly site = inject(TenantService).dahira;

  protected readonly name = computed(() => this.auth.current()?.profile.shortName ?? this.site().shortName);
  protected readonly logo = computed(() => this.site().logoSmallUrl ?? this.site().logoUrl);

  protected async signOut(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/admin/connexion');
  }
}
