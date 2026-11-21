import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DahiraEvent } from '../../../core/models';
import {
  daysUntil,
  fmtCountdown,
  fmtDay,
  fmtMonthShort,
  fmtEventTime,
  fmtWeekday,
} from '../../../core/utils/dates';

/** Carte « billet » du prochain rendez-vous. */
@Component({
  selector: 'app-event-ticket',
  imports: [RouterLink],
  templateUrl: './event-ticket.html',
  styleUrl: './event-ticket.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventTicket {
  readonly event = input.required<DahiraEvent>();

  protected readonly day = computed(() => fmtDay(this.event().startsAt));
  protected readonly month = computed(() => fmtMonthShort(this.event().startsAt));
  protected readonly weekday = computed(() => fmtWeekday(this.event().startsAt));
  protected readonly countdown = computed(() => fmtCountdown(daysUntil(this.event().startsAt)));
  protected readonly time = computed(() => fmtEventTime(this.event()));
}
