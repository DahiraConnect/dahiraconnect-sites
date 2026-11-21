import { inject } from '@angular/core';
import { CanActivateFn, ResolveFn, Router } from '@angular/router';
import { AlbumService } from '../../core/data/album.service';
import { SeoData } from '../../core/seo/seo.service';
import { fmtDate } from '../../core/utils/dates';
import { albumCover, albumPhotoCount } from '../../core/models';

const find = (slug: string | null) => inject(AlbumService).bySlug(slug ?? '');

/** Slug inconnu → retour à la liste. */
export const albumExistsGuard: CanActivateFn = (route) =>
  !!find(route.paramMap.get('album')) || inject(Router).parseUrl('/galerie');

export const albumTitleResolver: ResolveFn<string> = (route) =>
  find(route.paramMap.get('album'))?.title ?? '';

export const albumSeoResolver: ResolveFn<SeoData> = (route) => {
  const album = find(route.paramMap.get('album'));
  return album
    ? {
        description: [album.kind === 'video' ? 'Vidéo' : `${albumPhotoCount(album)} photos`, fmtDate(album.date), album.place]
          .filter(Boolean)
          .join(' · '),
        image: albumCover(album),
      }
    : {};
};
