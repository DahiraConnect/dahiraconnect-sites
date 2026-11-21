/** '1 membre', '28 membres', '0 photo' (règle française : 0 et 1 au singulier). */
export const plural = (n: number, singular: string, pluralForm = `${singular}s`) =>
  `${n} ${n > 1 ? pluralForm : singular}`;
