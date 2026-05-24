import {
  formatDateKey,
  getMaxCalendarDay,
  getNextAllowedDay,
  isDayLocked,
  parseDateKey,
} from './speechTrainingProgress';

describe('speechTrainingProgress calendar', () => {
  const start = '2026-05-24';

  test('day 1 only on signup date', () => {
    const signup = parseDateKey(start);
    expect(getMaxCalendarDay(start, signup)).toBe(1);
    expect(isDayLocked(2, {}, {}, start, signup)).toBe(true);
    expect(isDayLocked(1, {}, {}, start, signup)).toBe(false);
  });

  test('day 2 unlocks next calendar day at midnight', () => {
    const nextDay = new Date(2026, 4, 25, 8, 0, 0);
    expect(getMaxCalendarDay(start, nextDay)).toBe(2);
    expect(
      isDayLocked(2, { 1: true }, {}, start, nextDay)
    ).toBe(false);
  });

  test('completed day 1 same day does not unlock day 2 until tomorrow', () => {
    const signup = parseDateKey(start);
    expect(getNextAllowedDay({ 1: true }, {}, start, signup)).toBe(null);
    expect(isDayLocked(2, { 1: true }, {}, start, signup)).toBe(true);
  });

  test('day 2 available after midnight when day 1 complete', () => {
    const nextDay = new Date(2026, 4, 25, 0, 1, 0);
    expect(getNextAllowedDay({ 1: true }, {}, start, nextDay)).toBe(2);
  });
});
