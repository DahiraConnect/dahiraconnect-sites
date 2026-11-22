import { Injectable, signal } from '@angular/core';

export interface DialogRequest {
  title: string;
  message?: string;
  /** Texte du bouton principal : « Supprimer », « Retirer »… (jamais seulement « OK ») */
  confirmLabel: string;
  cancelLabel?: string;
  /** 'danger' : action définitive, bouton rouge */
  tone?: 'default' | 'danger';
  icon?: string;
  /** Champ de saisie (remplace prompt) */
  input?: { label: string; placeholder?: string; value?: string };
}

interface Pending extends DialogRequest {
  resolve: (value: string | boolean | null) => void;
}

/** Fenêtres de confirmation et de saisie aux couleurs du site (à la place de confirm / prompt du navigateur) */
@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly current = signal<Pending | null>(null);

  /** Oui / non */
  confirm(request: Omit<DialogRequest, 'input'>): Promise<boolean> {
    return new Promise((resolve) => this.current.set({ ...request, resolve: (v) => resolve(v === true) }));
  }

  /** Saisie d'un texte ; null si annulé */
  ask(request: DialogRequest & { input: NonNullable<DialogRequest['input']> }): Promise<string | null> {
    return new Promise((resolve) =>
      this.current.set({ ...request, resolve: (v) => resolve(typeof v === 'string' ? v : null) }),
    );
  }

  close(value: string | boolean | null): void {
    const pending = this.current();
    this.current.set(null);
    pending?.resolve(value);
  }
}
