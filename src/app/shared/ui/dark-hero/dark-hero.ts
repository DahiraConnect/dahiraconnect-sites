import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TenantService } from '../../../core/tenant/tenant.service';

/**
 * Hero vert profond + motif étoilé + topbar (logo, nom court, « Rappels »).
 * Contenu projeté : surtitre, h1, texte, CTA. La section suivante utilise `m.overlap-sheet`.
 */
@Component({
  selector: 'app-dark-hero',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './dark-hero.html',
  styleUrl: './dark-hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DarkHero {
  protected readonly dahira = inject(TenantService).dahira;
}
