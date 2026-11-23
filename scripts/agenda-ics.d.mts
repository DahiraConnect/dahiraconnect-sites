import type { Dahira, DahiraEvent } from '../src/app/core/models';
export function buildIcs(
  dahira: Dahira,
  events: DahiraEvent[],
  siteUrl: string,
  now?: Date,
): string;
