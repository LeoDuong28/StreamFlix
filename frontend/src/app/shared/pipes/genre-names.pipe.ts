import { Pipe, PipeTransform } from '@angular/core';
import { Genre } from '../../core/models/content.model';

@Pipe({ name: 'genreNames', standalone: true })
export class GenreNamesPipe implements PipeTransform {
  transform(genres: Genre[] | null | undefined): string {
    return (genres ?? []).map((g) => g.name).join(', ');
  }
}
