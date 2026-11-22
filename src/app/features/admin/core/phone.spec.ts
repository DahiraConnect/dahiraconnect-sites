import { formatLocal, toWhatsappNumber } from './phone';

describe('admin / phone', () => {
  it('accepte les écritures courantes', () => {
    expect(toWhatsappNumber('77 123 45 67')).toBe('221771234567');
    expect(toWhatsappNumber('+221 77 123 45 67')).toBe('221771234567');
    expect(toWhatsappNumber('00221771234567')).toBe('221771234567');
    expect(toWhatsappNumber('33 800 00 00')).toBe('221338000000');
    expect(toWhatsappNumber('+33 6 12 34 56 78')).toBe('33612345678');
  });

  it('refuse un numéro incomplet', () => {
    expect(toWhatsappNumber('77 123')).toBe('');
    expect(toWhatsappNumber('')).toBe('');
  });

  it('formatLocal', () => {
    expect(formatLocal('221771234567')).toBe('77 123 45 67');
    expect(formatLocal('33612345678')).toBe('33612345678');
  });
});
