import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const R = 40;
const C = 2 * Math.PI * R;

/** Cercle de progression avec le nombre de jours restants au centre. */
@Component({
  selector: 'app-countdown-ring',
  templateUrl: './countdown-ring.html',
  styleUrl: './countdown-ring.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownRing {
  readonly days = input.required<number>();
  readonly maxDays = input<number>(30);

  protected readonly r = R;
  protected readonly circumference = C;
  protected readonly offset = computed(() => {
    const ratio = Math.min(1, Math.max(0, this.days() / this.maxDays()));
    return C * (1 - ratio);
  });
  protected readonly unit = computed(() => (this.days() > 1 ? 'jours' : 'jour'));
}
