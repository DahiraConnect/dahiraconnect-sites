import { parseVideo } from './video';

describe('parseVideo', () => {
  it('reconnaît une vidéo TikTok et prépare le lecteur vertical', () => {
    const v = parseVideo('https://www.tiktok.com/@dahiramoutahabinafilah0/video/7707726783621106964');
    expect(v.platform).toBe('tiktok');
    expect(v.label).toBe('TikTok');
    expect(v.vertical).toBeTrue();
    expect(v.embedUrl).toBe('https://www.tiktok.com/embed/v2/7707726783621106964');
  });

  it('garde un lien court TikTok sans lecteur intégré', () => {
    const v = parseVideo('https://vm.tiktok.com/ZSsJGuG2n/');
    expect(v.platform).toBe('tiktok');
    expect(v.embedUrl).toBeUndefined();
  });

  it('reconnaît les formats de liens YouTube', () => {
    for (const url of [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=30',
    ]) {
      const v = parseVideo(url);
      expect(v.platform).withContext(url).toBe('youtube');
      expect(v.embedUrl).withContext(url).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
      expect(v.thumbnailUrl).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
      expect(v.vertical).toBeFalse();
    }
  });

  it('traite les Shorts YouTube comme verticaux', () => {
    expect(parseVideo('https://www.youtube.com/shorts/dQw4w9WgXcQ').vertical).toBeTrue();
  });

  it('accepte un lien Facebook ou inconnu (lien direct seulement)', () => {
    expect(parseVideo('https://www.facebook.com/watch?v=1').platform).toBe('facebook');
    expect(parseVideo('pas une url').platform).toBe('other');
  });
});
