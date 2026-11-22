/**
 * Numéro saisi comme on le dit (« 77 123 45 67 », « +221 77… », « 00221… »)
 * → format international sans + pour WhatsApp : '221771234567'.
 * Renvoie '' si le numéro est incomplet.
 */
export function toWhatsappNumber(input: string): string {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  // Numéro sénégalais local (9 chiffres : 7x, 3x)
  if (digits.length === 9 && /^[37]/.test(digits)) digits = `221${digits}`;
  return digits.length >= 10 && digits.length <= 15 ? digits : '';
}

/** '221771234567' → '77 123 45 67' (affichage lisible, Sénégal) */
export function formatLocal(international: string): string {
  const d = international.replace(/\D/g, '');
  const local = d.startsWith('221') && d.length === 12 ? d.slice(3) : d;
  return local.length === 9 ? local.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4') : international;
}
