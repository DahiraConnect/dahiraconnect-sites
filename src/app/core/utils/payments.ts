import { SupportSettings } from '../models';

export interface PaymentMethod {
  id: 'wave' | 'orange-money';
  name: string;
  logoUrl: string;
}

export interface PaymentGroup {
  /** Numéro tel qu'affiché (format du premier moyen) */
  number: string;
  methods: PaymentMethod[];
  /** 'Wave ou Orange Money' */
  label: string;
  logos: string[];
}

const METHODS: Record<PaymentMethod['id'], Omit<PaymentMethod, 'id'>> = {
  wave: { name: 'Wave', logoUrl: '/assets/payments/wave.webp' },
  'orange-money': { name: 'Orange Money', logoUrl: '/assets/payments/orange-money.webp' },
};

/** Numéro sans espaces ni indicatif +221 / 00221, pour comparer. */
export const normalizeNumber = (n: string) => n.replace(/\D/g, '').replace(/^(00)?221(?=\d{9}$)/, '');

/**
 * Regroupe les moyens de paiement qui partagent le même numéro :
 * un seul numéro à copier, avec les logos de chaque service.
 */
export function groupPayments(support: SupportSettings | undefined): PaymentGroup[] {
  if (!support) return [];
  const entries: [PaymentMethod['id'], string | undefined][] = [
    ['wave', support.wave],
    ['orange-money', support.orangeMoney],
  ];
  const groups = new Map<string, PaymentGroup>();
  for (const [id, number] of entries) {
    if (!number?.trim()) continue;
    const key = normalizeNumber(number);
    const method = { id, ...METHODS[id] };
    const group = groups.get(key);
    if (group) group.methods.push(method);
    else groups.set(key, { number: number.trim(), methods: [method], label: '', logos: [] });
  }
  return [...groups.values()].map((g) => ({
    ...g,
    label: g.methods.map((m) => m.name).join(' ou '),
    logos: g.methods.map((m) => m.logoUrl),
  }));
}
