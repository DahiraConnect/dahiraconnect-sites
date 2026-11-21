import { DOCUMENT, DestroyRef, Injectable, afterNextRender, inject, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

/** Événement non standard de Chrome / Android (invitation à installer). */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'dc-install-dismissed-until';
const DISMISS_DAYS = 30;
const SHOW_DELAY_MS = 12_000;

/**
 * Application installable (PWA) :
 * - invitation à installer (Android : bouton natif ; iPhone : explication du geste) ;
 * - état de connexion (bandeau hors ligne) ;
 * - mise à jour silencieuse : la nouvelle version se charge à la navigation suivante.
 */
@Injectable({ providedIn: 'root' })
export class PwaService {
  private readonly document = inject(DOCUMENT);
  private deferred: BeforeInstallPromptEvent | null = null;

  /** 'android' : bouton Installer ; 'ios' : explication ; null : rien à proposer */
  readonly installMode = signal<'android' | 'ios' | null>(null);
  readonly offline = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    const router = inject(Router);
    const updates = inject(SwUpdate);

    afterNextRender(() => {
      const win = this.document.defaultView!;
      if (this.isStandalone(win)) return;

      const onPrompt = (event: Event) => {
        event.preventDefault();
        this.deferred = event as BeforeInstallPromptEvent;
        this.scheduleInvite('android');
      };
      const onInstalled = () => this.installMode.set(null);
      const onOnline = () => this.offline.set(false);
      const onOffline = () => this.offline.set(true);

      win.addEventListener('beforeinstallprompt', onPrompt);
      win.addEventListener('appinstalled', onInstalled);
      win.addEventListener('online', onOnline);
      win.addEventListener('offline', onOffline);
      this.offline.set(!win.navigator.onLine);

      // iPhone / iPad : pas d'invitation native, on explique le geste
      if (/iphone|ipad|ipod/i.test(win.navigator.userAgent)) this.scheduleInvite('ios');

      destroyRef.onDestroy(() => {
        win.removeEventListener('beforeinstallprompt', onPrompt);
        win.removeEventListener('appinstalled', onInstalled);
        win.removeEventListener('online', onOnline);
        win.removeEventListener('offline', onOffline);
      });
    });

    // Nouvelle version prête : rechargement complet à la prochaine navigation (invisible)
    if (updates.isEnabled) {
      let updateReady = false;
      const sub = updates.versionUpdates
        .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
        .subscribe(() => (updateReady = true));
      const nav = router.events
        .pipe(filter((e): e is NavigationStart => e instanceof NavigationStart))
        .subscribe((e) => {
          if (updateReady) this.document.location.assign(e.url);
        });
      destroyRef.onDestroy(() => {
        sub.unsubscribe();
        nav.unsubscribe();
      });
    }
  }

  async install(): Promise<void> {
    if (!this.deferred) return;
    await this.deferred.prompt();
    const { outcome } = await this.deferred.userChoice;
    this.deferred = null;
    if (outcome === 'accepted') this.installMode.set(null);
    else this.dismiss();
  }

  /** « Plus tard » : on ne redemande pas avant 30 jours. */
  dismiss(): void {
    this.installMode.set(null);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86_400_000));
    } catch {
      /* stockage indisponible (navigation privée) : on masque pour cette visite */
    }
  }

  private scheduleInvite(mode: 'android' | 'ios'): void {
    if (this.recentlyDismissed()) return;
    setTimeout(() => this.installMode.set(mode), SHOW_DELAY_MS);
  }

  private recentlyDismissed(): boolean {
    try {
      return Number(localStorage.getItem(DISMISS_KEY) ?? 0) > Date.now();
    } catch {
      return false;
    }
  }

  private isStandalone(win: Window): boolean {
    return (
      win.matchMedia('(display-mode: standalone)').matches ||
      (win.navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  }
}
