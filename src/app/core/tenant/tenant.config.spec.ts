import { DEFAULT_TENANT, resolveTenantSlug } from './tenant.config';

describe('resolveTenantSlug', () => {
  const slug = (url: string) => resolveTenantSlug(new URL(url));

  it('lit le sous-domaine', () => {
    expect(slug('https://moutahabina.dahiraconnect.sn/agenda')).toBe('moutahabina');
  });

  it('ignore www et le domaine nu', () => {
    expect(slug('https://www.dahiraconnect.sn/')).toBeNull();
    expect(slug('https://dahiraconnect.sn/')).toBeNull();
  });

  it('privilégie ?tenant= en local', () => {
    expect(slug('http://localhost:4200/?tenant=autre-dahira')).toBe('autre-dahira');
  });

  it('reconnaît akkili.sn sans autoriser le changement de dahira par query publique', () => {
    expect(slug('https://nouveau.akkili.sn/?tenant=moutahabina')).toBe('nouveau');
    expect(slug('https://inconnu.example/')).toBeNull();
    expect(slug('https://a.b.akkili.sn/')).toBeNull();
  });

  it('refuse un slug invalide', () => {
    expect(slug('http://localhost:4200/?tenant=<script>')).toBe(DEFAULT_TENANT);
  });
});
