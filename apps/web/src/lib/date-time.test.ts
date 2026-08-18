import { describe, expect, it } from 'vitest';
import { formatLocalDate, getGreetingForHour } from './date-time';

describe('getGreetingForHour', () => {
  it('uses morning from 05:00 through 11:59', () => {
    expect(getGreetingForHour(5)).toBe('Good morning');
    expect(getGreetingForHour(11)).toBe('Good morning');
  });

  it('uses afternoon from 12:00 through 16:59', () => {
    expect(getGreetingForHour(12)).toBe('Good afternoon');
    expect(getGreetingForHour(16)).toBe('Good afternoon');
  });

  it('uses evening from 17:00 through 04:59', () => {
    expect(getGreetingForHour(17)).toBe('Good evening');
    expect(getGreetingForHour(23)).toBe('Good evening');
    expect(getGreetingForHour(0)).toBe('Good evening');
    expect(getGreetingForHour(4)).toBe('Good evening');
  });
});

describe('formatLocalDate', () => {
  it('formats a date with a human-readable weekday, month, day, and year', () => {
    const localDate = new Date(2026, 7, 18, 15, 30);

    expect(formatLocalDate(localDate, 'en-US')).toBe('Tuesday, August 18, 2026');
  });
});
