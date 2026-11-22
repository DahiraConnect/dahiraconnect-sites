import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Charter, CharterRule, HistoryStep, PageContent, ScheduleStep } from '../../../core/models';
import { DahiraDocStore } from '../core/dahira-doc.store';
import { HelpTip } from '../ui/help-tip/help-tip';

const EMPTY_CHARTER: Charter = { intro: '', rules: [], schedule: [] };

/** Déplace un élément d'une liste (monter / descendre) */
function move<T>(list: T[], i: number, delta: number): void {
  const [item] = list.splice(i, 1);
  list.splice(i + delta, 0, item);
}

/**
 * Textes du site, rangés comme les pages : accueil, rejoindre, histoire, charte.
 * La lignée et la biographie du guide restent validées par la commission (fichiers du dépôt).
 */
@Component({
  selector: 'app-admin-content',
  imports: [FormsModule, RouterLink, HelpTip, NgTemplateOutlet],
  templateUrl: './admin-content.page.html',
  styleUrl: './admin-content.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminContentPage {
  protected readonly store = inject(DahiraDocStore);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  /** Copie de travail, modifiée directement par les champs */
  protected c: PageContent | null = null;
  protected readonly move = move;

  constructor() {
    this.store.load(true).finally(() => this.loading.set(false));
    effect(() => {
      const content = this.store.content();
      if (content) {
        const copy = structuredClone(content);
        copy.charter ??= structuredClone(EMPTY_CHARTER);
        this.c = copy;
      }
    });
  }

  // ——— Listes ———
  protected addStep(): void {
    this.c!.join.steps.push('');
  }

  protected addHistory(): void {
    this.c!.about.history.push({ year: '', title: '', text: '' });
  }

  protected addRule(): void {
    this.c!.charter!.rules.push({ title: '' });
  }

  protected addAmount(rule: CharterRule): void {
    (rule.amounts ??= []).push({ label: '', amount: '' });
  }

  protected addSchedule(): void {
    this.c!.charter!.schedule.push({ time: '', label: '' });
  }

  protected remove<T>(list: T[], i: number): void {
    list.splice(i, 1);
  }

  /** Une seule étape « mise en avant » (la plus récente, en vert) */
  protected highlight(step: HistoryStep): void {
    for (const s of this.c!.about.history) s.highlight = s === step ? !step.highlight : false;
  }

  protected trackIndex = (i: number) => i;

  // ——— Enregistrement ———
  private clean(c: PageContent): PageContent {
    const t = (s?: string) => (s ?? '').trim();
    const charter = c.charter!;
    const cleaned: PageContent = {
      ...c,
      home: { aboutTitle: t(c.home.aboutTitle), aboutText: t(c.home.aboutText) },
      join: { intro: t(c.join.intro), steps: c.join.steps.map(t).filter(Boolean) },
      about: {
        heroTitle: t(c.about.heroTitle),
        history: c.about.history
          .map((h) => ({ year: t(h.year), title: t(h.title), text: t(h.text), ...(h.highlight ? { highlight: true } : {}) }))
          .filter((h) => h.year || h.title),
      },
      charter: {
        intro: t(charter.intro),
        rules: charter.rules
          .filter((r) => t(r.title))
          .map((r) => {
            const amounts = (r.amounts ?? []).filter((a) => t(a.label) || t(a.amount)).map((a) => ({ label: t(a.label), amount: t(a.amount) }));
            return {
              title: t(r.title),
              ...(t(r.wolof) ? { wolof: t(r.wolof) } : {}),
              ...(t(r.detail) ? { detail: t(r.detail) } : {}),
              ...(amounts.length ? { amounts } : {}),
            };
          }),
        schedule: charter.schedule
          .filter((s: ScheduleStep) => t(s.time) || t(s.label))
          .map((s) => ({ time: t(s.time), label: t(s.label) })),
        ...(t(charter.scheduleNote) ? { scheduleNote: t(charter.scheduleNote) } : {}),
      },
    };
    return cleaned;
  }

  protected async save(): Promise<void> {
    if (!this.c) return;
    const cleaned = this.clean(this.c);
    if (!cleaned.home.aboutTitle || !cleaned.about.heroTitle) {
      this.error.set('Les titres de l’accueil et de « Qui sommes-nous » ne peuvent pas être vides.');
      return;
    }
    this.error.set('');
    this.busy.set(true);
    const ok = await this.store.saveContent(cleaned, 'Textes enregistrés');
    this.busy.set(false);
    if (!ok) this.error.set('L’enregistrement a échoué. Vérifiez votre connexion et réessayez.');
  }
}
