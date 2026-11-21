import { DEFAULT_TENANT, resolveTenantSlug } from './tenant.config';

describe('resolveTenantSlug', () => {
  const slug = (url: string) => resolveTenantSlug(new URL(url));

  it('lit le sous-domaine', () => {
    expect(slug('https://moutahabina.dahiraconnect.sn/agenda')).toBe('moutahabina');
  });

  it('ignore www et le domaine nu', () => {
    expect(slug('https://www.dahiraconnect.sn/')).toBe(DEFAULT_TENANT);
    expect(slug('https://dahiraconnect.sn/')).toBe(DEFAULT_TENANT);
  });

  it('privilégie ?tenant= en local', () => {
    expect(slug('http://localhost:4200/?tenant=autre-dahira')).toBe('autre-dahira');
  });

  it('refuse un slug invalide', () => {
    expect(slug('http://localhost:4200/?tenant=<script>')).toBe(DEFAULT_TENANT);
  });
});
