import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, input, output, signal, viewChild } from '@angular/core';
import { CropView, clampOffset, displayScale, sourceRect } from './crop';

const FRAME = 280;
const OUT = 800;

/** Recadrage d'une photo de profil : déplacer au doigt, zoomer, valider (carré 800 px). */
@Component({
  selector: 'app-cropper',
  templateUrl: './cropper.html',
  styleUrl: './cropper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cropper {
  readonly file = input.required<File>();
  readonly done = output<File>();
  readonly cancel = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  protected readonly frame = FRAME;
  protected readonly src = computed(() => URL.createObjectURL(this.file()));
  protected readonly natural = signal<{ w: number; h: number } | null>(null);
  protected readonly zoom = signal(1);
  protected readonly offset = signal({ x: 0, y: 0 });
  private drag?: { id: number; x: number; y: number; ox: number; oy: number };
  private image?: HTMLImageElement;

  private view(o = this.offset(), zoom = this.zoom()): CropView {
    const n = this.natural()!;
    return { frame: FRAME, width: n.w, height: n.h, zoom, x: o.x, y: o.y };
  }

  /** Position et taille de l'image dans le cadre */
  protected readonly imgStyle = computed(() => {
    const n = this.natural();
    if (!n) return {};
    const s = displayScale(this.view());
    const o = this.offset();
    return {
      width: `${n.w * s}px`,
      height: `${n.h * s}px`,
      transform: `translate(calc(-50% + ${o.x}px), calc(-50% + ${o.y}px))`,
    };
  });

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  protected onLoad(img: HTMLImageElement): void {
    this.image = img;
    this.natural.set({ w: img.naturalWidth, h: img.naturalHeight });
  }

  protected onZoom(value: string): void {
    const zoom = Number(value);
    this.zoom.set(zoom);
    this.offset.set(clampOffset(this.view(this.offset(), zoom)));
  }

  protected down(e: PointerEvent): void {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, ox: this.offset().x, oy: this.offset().y };
  }

  protected move(e: PointerEvent): void {
    if (!this.drag || e.pointerId !== this.drag.id || !this.natural()) return;
    const next = { x: this.drag.ox + e.clientX - this.drag.x, y: this.drag.oy + e.clientY - this.drag.y };
    this.offset.set(clampOffset(this.view(next)));
  }

  protected up(): void {
    this.drag = undefined;
  }

  /** Flèches du clavier : déplacer ; + / − : zoomer */
  protected key(e: KeyboardEvent): void {
    const step = 10;
    const o = this.offset();
    const moves: Record<string, { x: number; y: number }> = {
      ArrowLeft: { x: o.x - step, y: o.y },
      ArrowRight: { x: o.x + step, y: o.y },
      ArrowUp: { x: o.x, y: o.y - step },
      ArrowDown: { x: o.x, y: o.y + step },
    };
    if (moves[e.key]) {
      e.preventDefault();
      this.offset.set(clampOffset(this.view(moves[e.key])));
    }
  }

  protected async confirm(): Promise<void> {
    if (!this.image || !this.natural()) return;
    const r = sourceRect(this.view());
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = OUT;
    canvas.getContext('2d')!.drawImage(this.image, r.sx, r.sy, r.size, r.size, 0, 0, OUT, OUT);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.9));
    URL.revokeObjectURL(this.src());
    this.dialog().nativeElement.close();
    if (blob) this.done.emit(new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
  }

  protected close(): void {
    URL.revokeObjectURL(this.src());
    this.dialog().nativeElement.close();
    this.cancel.emit();
  }
}
