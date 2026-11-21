import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommissionView, Seat, initials } from '../../../core/data/board';
import { BoardService } from '../../../core/data/board.service';
import { Reveal } from '../../../shared/motion/reveal.directive';
import { DarkHero } from '../../../shared/ui/dark-hero/dark-hero';
import { MemberCard } from '../../../shared/ui/member-card/member-card';

const TONES = ['green', 'mid', 'blue', 'gold'] as const;

/** Le bureau : bureau exécutif puis commissions (une personne peut cumuler plusieurs postes). */
@Component({
  selector: 'app-board-page',
  imports: [RouterLink, NgOptimizedImage, DarkHero, MemberCard, Reveal],
  templateUrl: './board.page.html',
  styleUrl: './board.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BoardPage {
  protected readonly board = inject(BoardService).view;
  protected readonly initials = initials;
  protected readonly tone = (i: number) => TONES[i % TONES.length];
  /** Responsable en tête, puis les membres */
  protected readonly seatsOf = (c: CommissionView): Seat[] => (c.lead ? [c.lead, ...c.members] : c.members);
}
