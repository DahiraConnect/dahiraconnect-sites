import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminChip } from '../admin-chip/admin-chip';
import { TenantService } from '../../../core/tenant/tenant.service';

/** Barre de navigation ordinateur (≥ 1024 px). Sur mobile, c'est le dock qui navigue. */
@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage, AdminChip],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-scrolled]': 'scrolled()',
    '(window:scroll)': 'onScroll()',
  },
})
export class SiteHeader {
  protected readonly dahira = inject(TenantService).dahira;
  protected readonly scrolled = signal(false);

  protected readonly links = [
    { path: '/', label: 'Accueil', exact: true },
    { path: '/le-dahira', label: 'Le dahira', exact: false },
    { path: '/agenda', label: 'Agenda', exact: false },
    { path: '/galerie', label: 'Galerie', exact: false },
    { path: '/quiz', label: 'Quiz', exact: false },
  ];

  protected onScroll(): void {
    const scrolled = window.scrollY > 24;
    if (scrolled !== this.scrolled()) this.scrolled.set(scrolled);
  }
}
