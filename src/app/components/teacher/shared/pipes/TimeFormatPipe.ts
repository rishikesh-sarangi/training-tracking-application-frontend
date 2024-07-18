import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true,
})
export class TimeFormatPipe implements PipeTransform {
  transform(time: string): string {
    if (!time) return '';

    const [hourString, minute] = time.split(':');
    const hour = parseInt(hourString, 10);

    if (hour < 0 || hour > 23) {
      return time; // Return original string if hour is invalid
    }

    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // Convert 0 to 12 for midnight

    return `${hour12}:${minute} ${ampm}`;
  }
}
