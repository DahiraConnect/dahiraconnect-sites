import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

let nextId = 0;

/** Logo dans un anneau de texte doré qui tourne. */
@Component({
  selector: 'app-medallion',
  imports: [NgOptimizedImage],
  templateUrl: './medallion.html',
  styleUrl: './medallion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--size.px]': 'size()', '[class.has-ring]': '!!text()' },
})
export class Medallion {
  readonly logoUrl = input.required<string>();
  readonly alt = input.required<string>();
  /** Texte de l'anneau ; vide = logo seul, sans anneau */
  readonly text = input<string>('');
  readonly size = input<number>(300);
  readonly spin = input<boolean>(true);
  /** Image prioritaire (LCP) : uniquement pour le médaillon du hero */
  readonly priority = input<boolean>(false);

  protected readonly pathId = `medallion-ring-${nextId++}`;
  protected readonly center = computed(() => this.size() / 2);
  protected readonly radius = computed(() => this.size() / 2 - 16);
  protected readonly dashRadius = computed(() => this.size() / 2 - 4);
  protected readonly fontSize = computed(() => (this.size() >= 280 ? 14 : 13));
  protected readonly textLength = computed(() => Math.round(2 * Math.PI * this.radius() - 10));
  protected readonly path = computed(() => {
    const c = this.center();
    const r = this.radius();
    return `M${c},${c} m-${r},0 a${r},${r} 0 1,1 ${2 * r},0 a${r},${r} 0 1,1 -${2 * r},0`;
  });
  protected readonly logoSize = computed(() =>
    Math.round(this.text() ? this.size() * 0.7 : this.size()),
  );
}
