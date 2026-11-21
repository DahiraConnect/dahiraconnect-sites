import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Titre de section (h2) + lien « Voir → » facultatif. */
@Component({
  selector: 'app-section-heading',
  imports: [RouterLink],
  templateUrl: './section-heading.html',
  styleUrl: './section-heading.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeading {
  readonly title = input.required<string>();
  readonly linkLabel = input<string>('');
  readonly link = input<string>('');
  readonly headingId = input<string>('');
}
