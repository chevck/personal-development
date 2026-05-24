/** Local calendar date as YYYY-MM-DD (programme timezone = user browser). */
export function formatDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function daysBetweenDateKeys(startKey, endKey) {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((utcEnd - utcStart) / (24 * 60 * 60 * 1000));
}

/** Day 1 on signup date; day 2 from the next calendar day at 00:00, etc. */
export function getMaxCalendarDay(programStartDate, now = new Date()) {
  if (!programStartDate) return 1;
  const elapsed = daysBetweenDateKeys(programStartDate, formatDateKey(now));
  return Math.min(21, Math.max(1, elapsed + 1));
}

export function getCalendarUnlockDateForDay(programStartDate, dayNum) {
  const date = parseDateKey(programStartDate);
  date.setDate(date.getDate() + (dayNum - 1));
  return date;
}

export function isDayComplete(dayNum, completed, assessments = {}) {
  return Boolean(completed[dayNum]) && !assessments[dayNum]?.requiresRedo;
}

export function isCalendarLocked(dayNum, programStartDate, now = new Date()) {
  if (!programStartDate) return dayNum > 1;
  return dayNum > getMaxCalendarDay(programStartDate, now);
}

export function getNextAllowedDay(
  completed,
  assessments = {},
  programStartDate,
  now = new Date()
) {
  const maxCalendar = getMaxCalendarDay(programStartDate, now);

  for (let day = 1; day <= 21; day += 1) {
    if (isDayComplete(day, completed, assessments)) continue;
    if (day > maxCalendar) return null;
    return day;
  }

  return null;
}

export function getDayLockReason(
  dayNum,
  completed,
  assessments = {},
  programStartDate,
  now = new Date()
) {
  if (isDayComplete(dayNum, completed, assessments)) return null;
  if (isCalendarLocked(dayNum, programStartDate, now)) return 'calendar';
  const next = getNextAllowedDay(completed, assessments, programStartDate, now);
  if (next !== null && dayNum > next) return 'sequence';
  return null;
}

export function isDayLocked(
  dayNum,
  completed,
  assessments = {},
  programStartDate,
  now = new Date()
) {
  return getDayLockReason(dayNum, completed, assessments, programStartDate, now) !== null;
}

export function getDayLockMessage(
  dayNum,
  completed,
  assessments = {},
  programStartDate,
  now = new Date()
) {
  const reason = getDayLockReason(dayNum, completed, assessments, programStartDate, now);
  if (reason === 'calendar') {
    const unlockDate = getCalendarUnlockDateForDay(programStartDate, dayNum);
    const tonight = formatDateKey(now) === formatDateKey(unlockDate);
    if (tonight) {
      return `Day ${dayNum} unlocks at midnight tonight. One challenge per calendar day.`;
    }
    return `Day ${dayNum} unlocks on ${unlockDate.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })}.`;
  }
  if (reason === 'sequence') {
    return `Complete Day ${dayNum - 1} before you can start Day ${dayNum}.`;
  }
  return null;
}

export function getWaitingForNextDayMessage(
  completed,
  assessments = {},
  programStartDate,
  now = new Date()
) {
  if (!programStartDate) return null;

  const maxCalendar = getMaxCalendarDay(programStartDate, now);
  if (getNextAllowedDay(completed, assessments, programStartDate, now) !== null) {
    return null;
  }

  for (let day = 1; day <= 21; day += 1) {
    if (isDayComplete(day, completed, assessments)) continue;
    if (day > maxCalendar) {
      return getDayLockMessage(day, completed, assessments, programStartDate, now);
    }
    return null;
  }

  return null;
}

export function canSaveDay(
  dayNum,
  completed,
  assessments = {},
  hasRecording = false,
  programStartDate,
  now = new Date()
) {
  if (hasRecording || isDayComplete(dayNum, completed, assessments)) return true;
  if (isDayLocked(dayNum, completed, assessments, programStartDate, now)) return false;
  if (dayNum === 1) return true;
  return isDayComplete(dayNum - 1, completed, assessments);
}

export function getSaveDayError(
  dayNum,
  completed,
  assessments = {},
  hasRecording = false,
  programStartDate,
  now = new Date()
) {
  if (canSaveDay(dayNum, completed, assessments, hasRecording, programStartDate, now)) {
    return null;
  }
  return (
    getDayLockMessage(dayNum, completed, assessments, programStartDate, now) ||
    `You cannot save Day ${dayNum} yet.`
  );
}

export function getProgramStartDateFromUser(user) {
  if (user?.metadata?.creationTime) {
    return formatDateKey(new Date(user.metadata.creationTime));
  }
  return formatDateKey(new Date());
}
