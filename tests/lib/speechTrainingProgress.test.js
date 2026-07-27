import {
  getActivePhaseIndex,
  getActiveWeekIndex,
  getMaxCalendarDay,
  getNextAllowedDay,
  getPhaseIndexForDay,
  getWeekDayRange,
  isDayLocked,
  parseDateKey,
} from '../../src/lib/speechTrainingProgress';

describe('speechTrainingProgress calendar', () => {
  const start = '2026-05-24';

  test('day 1 only on signup date', () => {
    const signup = parseDateKey(start);
    expect(getMaxCalendarDay(start, signup, 21)).toBe(1);
    expect(isDayLocked(2, {}, {}, start, signup, 21)).toBe(true);
    expect(isDayLocked(1, {}, {}, start, signup, 21)).toBe(false);
  });

  test('day 2 unlocks next calendar day at midnight', () => {
    const nextDay = new Date(2026, 4, 25, 8, 0, 0);
    expect(getMaxCalendarDay(start, nextDay, 21)).toBe(2);
    expect(
      isDayLocked(2, { 1: true }, {}, start, nextDay, 21)
    ).toBe(false);
  });

  test('completed day 1 same day does not unlock day 2 until tomorrow', () => {
    const signup = parseDateKey(start);
    expect(getNextAllowedDay({ 1: true }, {}, start, signup, 21)).toBe(null);
    expect(isDayLocked(2, { 1: true }, {}, start, signup, 21)).toBe(true);
  });

  test('day 2 available after midnight when day 1 complete', () => {
    const nextDay = new Date(2026, 4, 25, 0, 1, 0);
    expect(getNextAllowedDay({ 1: true }, {}, start, nextDay, 21)).toBe(2);
  });

  test('active week follows calendar day', () => {
    const signup = parseDateKey(start);
    expect(getPhaseIndexForDay(1)).toBe(0);
    expect(getPhaseIndexForDay(7)).toBe(0);
    expect(getPhaseIndexForDay(8)).toBe(1);
    expect(getActivePhaseIndex(start, signup, 21)).toBe(0);

    const day8 = new Date(2026, 4, 31, 12, 0, 0);
    expect(getMaxCalendarDay(start, day8, 21)).toBe(8);
    expect(getActivePhaseIndex(start, day8, 21)).toBe(1);
    expect(getWeekDayRange(1, 21)).toEqual({
      start: 8,
      end: 14,
      subtitle: 'Days 8–14',
    });
  });

  test('caps calendar day at chosen programme length', () => {
    const day30 = new Date(2026, 5, 23, 12, 0, 0);
    expect(getMaxCalendarDay(start, day30, 14)).toBe(14);
    expect(getNextAllowedDay({}, {}, start, day30, 14)).toBe(1);
  });
});

describe('getActiveWeekIndex', () => {
  const start = '2026-05-24';

  test('follows the currently open task, not the calendar week', () => {
    const day10 = new Date(2026, 5, 2, 12, 0, 0);
    const completed = { 1: true, 2: true, 3: true };
    expect(getMaxCalendarDay(start, day10, 21)).toBe(10);
    expect(getActivePhaseIndex(start, day10, 21)).toBe(1);
    expect(getNextAllowedDay(completed, {}, start, day10, 21)).toBe(4);
    expect(getActiveWeekIndex(completed, {}, start, day10, 21)).toBe(0);
  });

  test('moves to week 2 when open task is day 8', () => {
    const day8 = new Date(2026, 4, 31, 12, 0, 0);
    const completed = Object.fromEntries(
      Array.from({ length: 7 }, (_, i) => [i + 1, true]),
    );
    expect(getNextAllowedDay(completed, {}, start, day8, 21)).toBe(8);
    expect(getActiveWeekIndex(completed, {}, start, day8, 21)).toBe(1);
  });

  test('stays on next incomplete day while waiting overnight', () => {
    const signup = parseDateKey(start);
    expect(
      getActiveWeekIndex({ 1: true }, {}, start, signup, 21),
    ).toBe(0);
    expect(getNextAllowedDay({ 1: true }, {}, start, signup, 21)).toBe(null);
  });
});
