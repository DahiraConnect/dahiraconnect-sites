/** Lien « Click to chat » WhatsApp, avec message prérempli facultatif. */
export function buildWaLink(number: string, message?: string): string {
  const digits = number.replace(/\D/g, '');
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${text}`;
}

/** Lien de partage WhatsApp (l'utilisateur choisit le destinataire). */
export function buildWaShare(text: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
}

/** Numéro local lisible → lien tel: international. */
export function buildTelLink(number: string): string {
  const cleaned = number.replace(/[^\d+]/g, '');
  return `tel:${cleaned}`;
}
