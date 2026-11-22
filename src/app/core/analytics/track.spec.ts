import { clickKey, deviceType, viewKey } from './track';

const link = (href: string) => {
  const a = document.createElement('a');
  a.href = href;
  a.setAttribute('href', href);
  const span = document.createElement('span');
  a.appendChild(span);
  return span;
};

describe('analytics / track', () => {
  it('reconnaît les liens importants', () => {
    expect(clickKey(link('https://wa.me/221770000000?text=Salam'))).toBe('rejoindre_whatsapp');
    expect(clickKey(link('https://wa.me/?text=Ziar'))).toBe('partage_whatsapp');
    expect(clickKey(link('https://chat.whatsapp.com/AbC'))).toBe('rejoindre_groupe');
    expect(clickKey(link('tel:+221770000000'))).toBe('appel');
    expect(clickKey(link('https://maps.app.goo.gl/xyz'))).toBe('itineraire');
    expect(clickKey(link('https://www.tiktok.com/@dahira'))).toBe('reseau_tiktok');
    expect(clickKey(link('/agenda'))).toBeNull();
  });

  it('data-track prime', () => {
    const b = document.createElement('button');
    b.setAttribute('data-track', 'copie_numero');
    expect(clickKey(b)).toBe('copie_numero');
  });

  it('deviceType', () => {
    expect(deviceType(true, 390)).toBe('mobile');
    expect(deviceType(true, 820)).toBe('tablet');
    expect(deviceType(false, 1440)).toBe('desktop');
  });

  it('viewKey normalise et ignore l’admin', () => {
    expect(viewKey('/Agenda/Ziar-2026/?x=1#top')).toBe('/agenda/ziar-2026');
    expect(viewKey('/')).toBe('/');
    expect(viewKey('/admin/agenda')).toBeNull();
    expect(viewKey('/<script>')).toBeNull();
  });
});
