import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PwaService } from '../../../core/pwa/pwa.service';
import { tenantIconBase } from '../../../core/tenant/manifest';
import { TenantService } from '../../../core/tenant/tenant.service';

/** Invitation à installer l'application + bandeau hors ligne. */
@Component({
  selector: 'app-install-banner',
  imports: [NgOptimizedImage],
  templateUrl: './install-banner.html',
  styleUrl: './install-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallBanner {
  protected readonly pwa = inject(PwaService);
  protected readonly dahira = inject(TenantService).dahira;
  protected readonly icon = () => `${tenantIconBase(this.dahira().slug)}/icon-192.png`;
}
