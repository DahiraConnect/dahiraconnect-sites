import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Seat } from '../../../core/data/board';

/** Membre du bureau : photo en arche (silhouette si absente), rôle, nom. */
@Component({
  selector: 'app-member-card',
  imports: [NgOptimizedImage],
  templateUrl: './member-card.html',
  styleUrl: './member-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberCard {
  readonly seat = input.required<Seat>();
  /** Couleur de l'aplat quand il n'y a pas de photo */
  readonly tone = input<'green' | 'mid' | 'blue' | 'gold'>('green');
}
