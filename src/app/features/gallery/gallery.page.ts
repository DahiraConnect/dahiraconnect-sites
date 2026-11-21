import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Reveal } from '../../shared/motion/reveal.directive';
import { AlbumService } from '../../core/data/album.service';
import { fmtMonthYear } from '../../core/utils/dates';
import { AlbumCard } from '../../shared/ui/album-card/album-card';
import { DarkHero } from '../../shared/ui/dark-hero/dark-hero';

type Filter = 'all' | 'photos' | 'video';

@Component({
  selector: 'app-gallery-page',
  imports: [RouterLink, NgOptimizedImage, DarkHero, AlbumCard, Reveal],
  templateUrl: './gallery.page.html',
  styleUrl: './gallery.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GalleryPage {
  private readonly albums = inject(AlbumService);

  protected readonly filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'Tout' },
    { value: 'photos', label: 'Photos' },
    { value: 'video', label: 'Vidéos' },
  ];
  protected readonly filter = signal<Filter>('all');

  private readonly photoAlbums = computed(() =>
    this.filter() === 'video' ? [] : this.albums.all().filter((a) => a.kind === 'photos'),
  );
  protected readonly featured = computed(() => this.photoAlbums()[0]);
  protected readonly grid = computed(() => this.photoAlbums().slice(1));
  protected readonly videos = computed(() =>
    this.filter() === 'photos' ? [] : this.albums.all().filter((a) => a.kind === 'video'),
  );
  protected readonly fmtMonthYear = fmtMonthYear;
}
