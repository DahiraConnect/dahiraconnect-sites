import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DahiraEvent, HistoryStep, LineageStep } from '../../../core/models';
import { Reveal } from '../../motion/reveal.directive';
import { fmtDay, fmtMonthShort, fmtTimeRange } from '../../../core/utils/dates';

/** Frise verticale à fil doré : histoire, lignée ou agenda. */
@Component({
  selector: 'app-timeline',
  imports: [RouterLink, NgOptimizedImage, Reveal],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Timeline {
  readonly variant = input<'history' | 'lineage' | 'agenda'>('history');
  readonly history = input<HistoryStep[]>([]);
  readonly lineage = input<LineageStep[]>([]);
  readonly events = input<DahiraEvent[]>([]);

  protected readonly fmtDay = fmtDay;
  protected readonly fmtMonthShort = fmtMonthShort;
  protected readonly fmtTimeRange = fmtTimeRange;
}
