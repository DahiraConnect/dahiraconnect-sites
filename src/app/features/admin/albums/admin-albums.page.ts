import { ChangeDetectionStrategy, Component, computed, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Album, albumCover, albumPhotoCount } from '../../../core/models';
import { fmtDate } from '../../../core/utils/dates';
import { AdminAuth } from '../core/admin-auth.service';
import { listDocs } from '../core/docs';
import { matches } from '../core/search';
import { StatusBadge } from '../ui/status-badge/status-badge';

/** Liste des albums, du plus récent au plus ancien. */
@Component({
  selector: 'app-admin-albums',
  imports: [RouterLink, StatusBadge],
  templateUrl: './admin-albums.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminAlbumsPage {
  private readonly auth = inject(AdminAuth);

  protected readonly rows = resource({
    params: () => this.auth.current()?.dahiraId,
    loader: ({ params }) => listDocs<Album>('albums', params, 'date', false),
  });

  protected readonly query = signal('');
  protected readonly found = computed(() =>
    (this.rows.value() ?? []).filter((r) => matches(this.query(), r.data.title, r.data.place)),
  );
  protected readonly cover = albumCover;
  protected readonly meta = (a: Album) =>
    `${fmtDate(a.date)} · ${a.kind === 'video' ? 'Vidéo' : `${albumPhotoCount(a)} photo${albumPhotoCount(a) > 1 ? 's' : ''}`}`;
}
