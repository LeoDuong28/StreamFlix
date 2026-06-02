import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({ name: 'tmdbImage', standalone: true })
export class TmdbImagePipe implements PipeTransform {
  transform(path: string | null | undefined, size = 'w500'): string {
    if (!path) return 'https://placehold.co/500x750/1a1a1a/666?text=No+Image';
    if (path.startsWith('http')) return path;
    return `${environment.tmdbImageBaseUrl}/${size}${path}`;
  }
}
