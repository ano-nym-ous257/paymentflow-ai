export type Greeting = 'Good morning' | 'Good afternoon' | 'Good evening';

/** Morning is 05:00-11:59, afternoon is 12:00-16:59, and evening is 17:00-04:59. */
export function getGreetingForHour(hour: number): Greeting {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new RangeError('Hour must be an integer from 0 through 23.');
  }

  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatLocalDate(date: Date, locales?: Intl.LocalesArgument): string {
  return new Intl.DateTimeFormat(locales, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
