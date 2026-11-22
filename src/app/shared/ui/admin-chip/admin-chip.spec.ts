import { sessionStorageKey } from './admin-chip';

describe('admin-chip', () => {
  it('clé de session Supabase', () => {
    expect(sessionStorageKey('https://obrdjhhakqhcbttdbfek.supabase.co')).toBe('sb-obrdjhhakqhcbttdbfek-auth-token');
    expect(sessionStorageKey('http://127.0.0.1:56421')).toBe('sb-127-auth-token');
  });
});
