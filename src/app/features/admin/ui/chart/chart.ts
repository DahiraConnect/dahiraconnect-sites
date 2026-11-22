import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import type { Chart, ChartConfiguration } from 'chart.js';

/** Chart.js chargé à la demande (seulement dans l'admin, seulement s'il y a un graphique) */
let loader: Promise<typeof Chart> | undefined;
function loadChart(): Promise<typeof Chart> {
  loader ??= import('chart.js').then((m) => {
    m.Chart.register(
      m.BarController, m.BarElement, m.LineController, m.LineElement, m.PointElement,
      m.DoughnutController, m.ArcElement, m.CategoryScale, m.LinearScale, m.Tooltip, m.Filler,
    );
    m.Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    m.Chart.defaults.font.size = 13;
    return m.Chart;
  });
  return loader;
}

/** Graphique simple. Le texte de `label` est lu par les lecteurs d'écran. */
@Component({
  selector: 'app-chart',
  template: `<canvas #canvas role="img" [attr.aria-label]="label()"></canvas>`,
  styles: `:host { display: block; position: relative; } canvas { width: 100% !important; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartView {
  readonly config = input.required<ChartConfiguration>();
  readonly label = input.required<string>();
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart;

  constructor() {
    afterRenderEffect(async () => {
      const config = this.config();
      const ChartJs = await loadChart();
      if (this.chart) {
        this.chart.data = config.data;
        this.chart.update();
      } else {
        this.chart = new ChartJs(this.canvas().nativeElement, config);
      }
    });
    inject(DestroyRef).onDestroy(() => this.chart?.destroy());
  }
}
