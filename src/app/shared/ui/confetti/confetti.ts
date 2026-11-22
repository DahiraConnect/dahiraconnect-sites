import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';

/** Couleurs de la charte : or, vert vif, vert profond, ivoire */
const COLORS = ['#E2B743', '#1BB13E', '#0A3A1B', '#F4EFE3', '#D9B24C'];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  color: string;
  round: boolean;
}

/**
 * Pluie de confettis (canvas, sans bibliothèque) pendant ~3 s, puis s'efface.
 * Rien ne s'affiche si le téléphone demande des mouvements réduits.
 */
@Component({
  selector: 'app-confetti',
  template: `<canvas #canvas aria-hidden="true"></canvas>`,
  styles: `
    canvas {
      position: fixed;
      inset: 0;
      z-index: 90;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Confetti {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    let frame = 0;
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(frame));

    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const canvas = this.canvas().nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = (canvas.width = innerWidth * dpr);
      const h = (canvas.height = innerHeight * dpr);

      // Deux canons, en bas à gauche et à droite, qui tirent vers le centre
      const pieces: Piece[] = Array.from({ length: 140 }, (_, i) => {
        const left = i % 2 === 0;
        const angle = (left ? -60 : -120) * (Math.PI / 180) + (Math.random() - 0.5) * 0.7;
        const speed = (12 + Math.random() * 10) * dpr;
        return {
          x: left ? w * 0.08 : w * 0.92,
          y: h * 0.95,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: (6 + Math.random() * 7) * dpr,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.3,
          color: COLORS[i % COLORS.length],
          round: Math.random() < 0.3,
        };
      });

      const start = performance.now();
      const DURATION = 3200;
      const step = (now: number) => {
        const elapsed = now - start;
        ctx.clearRect(0, 0, w, h);
        ctx.globalAlpha = elapsed > DURATION - 800 ? Math.max(0, (DURATION - elapsed) / 800) : 1;
        for (const p of pieces) {
          p.vy += 0.32 * dpr; // gravité
          p.vx *= 0.99; // frottement de l'air
          p.vy *= 0.99;
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.spin;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          if (p.round) {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          }
          ctx.restore();
        }
        if (elapsed < DURATION) frame = requestAnimationFrame(step);
        else ctx.clearRect(0, 0, w, h);
      };
      frame = requestAnimationFrame(step);
    });
  }
}
