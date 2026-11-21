import { buildTelLink, buildWaLink, buildWaShare } from './whatsapp';

describe('whatsapp utils', () => {
  describe('buildWaLink', () => {
    it('garde uniquement les chiffres du numéro', () => {
      expect(buildWaLink('+221 77 000-00-00')).toBe('https://wa.me/221770000000');
    });

    it('encode le message prérempli', () => {
      expect(buildWaLink('221770000000', "Salam, je m'inscris & j'arrive")).toBe(
        'https://wa.me/221770000000?text=Salam%2C%20je%20m\'inscris%20%26%20j\'arrive',
      );
    });

    it("n'ajoute pas de paramètre text sans message", () => {
      expect(buildWaLink('221770000000', '')).toBe('https://wa.me/221770000000');
    });

    it('encode les caractères accentués', () => {
      expect(buildWaLink('221', 'é')).toBe('https://wa.me/221?text=%C3%A9');
    });
  });

  describe('buildWaShare', () => {
    it('joint le texte et le lien sur deux lignes', () => {
      expect(buildWaShare('Récital', 'https://x.sn/agenda')).toBe(
        'https://wa.me/?text=R%C3%A9cital%0Ahttps%3A%2F%2Fx.sn%2Fagenda',
      );
    });
  });

  describe('buildTelLink', () => {
    it('garde le + et les chiffres', () => {
      expect(buildTelLink('+221 77 000 00 00')).toBe('tel:+221770000000');
    });
  });
});
