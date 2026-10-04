import { Pipe, PipeTransform } from '@angular/core';
import { parseIso } from '@/shared/utils/iso-date';

const formatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });

@Pipe({ name: 'shortDate' })
export class ShortDatePipe implements PipeTransform {
  transform(isoDate: string): string {
    const { year, month, day } = parseIso(isoDate);
    return formatter.format(new Date(year, month - 1, day));
  }
}
