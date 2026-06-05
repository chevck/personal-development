/** Local calendar date as YYYY-MM-DD (programme timezone = user browser). */
import {
  DEFAULT_PROGRAM_DAYS,
  normalizeProgramDuration,
} from './speechTrainingProgram';

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
export function getMaxCalendarDay(
  programStartDate,
  now = new Date(),
  programDuration = DEFAULT_PROGRAM_DAYS,
) {
  if (!programStartDate) return 1;
  const duration = normalizeProgramDuration(programDuration);
  const elapsed = daysBetweenDateKeys(programStartDate, formatDateKey(now));
  return Math.min(duration, Math.max(1, elapsed + 1));
}

export function getPhaseIndexForDay(dayNum) {
  return Math.floor((Math.max(1, dayNum) - 1) / 7);
}

export function getActivePhaseIndex(
  programStartDate,
  now = new Date(),
  programDuration = DEFAULT_PROGRAM_DAYS,
) {
  return getPhaseIndexForDay(
    getMaxCalendarDay(programStartDate, now, programDuration),
  );
}

/** Week index for the learner's current task (allowed day, or next incomplete if waiting). */
export function getActiveWeekIndex(
  completed,
  assessments = {},
  programStartDate,
  now = new Date(),
  programDuration = DEFAULT_PROGRAM_DAYS,
) {
  const duration = normalizeProgramDuration(programDuration);
  const openDay = getNextAllowedDay(
    completed,
    assessments,
    programStartDate,
    now,
    duration,
  );
  if (openDay != null) {
    return getPhaseIndexForDay(openDay);
  }

  for (let day = 1; day <= duration; day += 1) {
    if (!isDayComplete(day, completed, assessments)) {
      return getPhaseIndexForDay(day);
    }
  }

  return getPhaseIndexForDay(duration);
}

export function getWeekLabel(phaseIndex) {
  return `Week ${phaseIndex + 1}`;
}

export function getWeekDayRange(
  phaseIndex,
  programDuration = DEFAULT_PROGRAM_DAYS,
) {
  const duration = normalizeProgramDuration(programDuration);
  const start = phaseIndex * 7 + 1;
  if (start > duration) {
    return { start, end: start, subtitle: '' };
  }
  const end = Math.min(start + 6, duration);
  return { start, end, subtitle: `Days ${start}–${end}` };
}

export function getCalendarUnlockDateForDay(programStartDate, dayNum) {
  const date = parseDateKey(programStartDate);
  date.setDate(date.getDate() + (dayNum - 1));
  return date;
}

export function isDayComplete(dayNum, completed, assessments = {}) {
  return Boolean(completed[dayNum]) && !assessments[dayNum]?.requiresRedo;
}

export function isBeyondProgramDay(dayNum, programDuration = DEFAULT_PROGRAM_DAYS) {
  return dayNum > normalizeProgramDuration(programDuration);
}

export function isCalendarLocked(
  dayNum,
  programStartDate,
  now = new Date(),
  programDuration = DEFAULT_PROGRAM_DAYS,
) {
  if (!programStartDate) return dayNum > 1;
  if (isBeyondProgramDay(dayNum, programDuration)) return true;
  return dayNum > getMaxCalendarDay(programStartDate, now, programDuration);
}

export function getNextAllowedDay(
  completed,
  assessments = {},
  programStartDate,
  now = new Date(),
  programDuration = DEFAULT_PROGRAM_DAYS,
) {
  const duration = normalizeProgramDuration(programDuration);
  const maxCalendar = getMaxCalendarDay(programStartDate, now, duration);

  for (let day = 1; day <= duration; day += 1) {
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
  now = new Date(),
  programDuration = DEFAULT_PROGRAM_DAYS,
) {
  if (isBeyondProgramDay(dayNum, programDuration)) return null;
  if (isDayComplete(dayNum, completed, assessments)) return null;
  if (isCalendarLocked(dayNum, programStartDate, now, programDuration)) {
    return 'calendar';
  }
  const next = getNextAllowedDay(
    completed,
    assessments,
    programStartDate,
    now,
    programDuration,
  );
  if (next !== null && dayNum > next) return 'sequence';
  return null;
}

export function isDayLocked(
  dayNum,
  completed,
  assessments = {},
  programStartDate,
  now = new Date(),
  programDuration = DEFAULT_PROGRAM_DAYS,
) {
  return (
    getDayLockReason(
      dayNum,
      completed,
      assessments,
      programStartDate,
      now,
      programDuration,
    ) !== null
  );
}

export function getDayLockMessage(
  dayNum,
  completed,
  assessments = {},
  programStartDate,
  now = new Date(),
  programDuration = DEFAULT_PROGRAM_DAYS,
) {
  const reason = getDayLockReason(
    dayNum,
    completed,
    assessments,
    programStartDate,
    now,
    programDuration,
  );
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
  now = new Date(),
  programDuration = DEFAULT_PROGRAM_DAYS,
) {
  if (!programStartDate) return null;

  const duration = normalizeProgramDuration(programDuration);
  const maxCalendar = getMaxCalendarDay(programStartDate, now, duration);
  if (getNextAllowedDay(completed, assessments, programStartDate, now, duration) !== null) {
    return null;
  }

  for (let day = 1; day <= duration; day += 1) {
    if (isDayComplete(day, completed, assessments)) continue;
    if (day > maxCalendar) {
      return getDayLockMessage(
        day,
        completed,
        assessments,
        programStartDate,
        now,
        duration,
      );
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
  now = new Date(),
  programDuration = DEFAULT_PROGRAM_DAYS,
) {
  if (isBeyondProgramDay(dayNum, programDuration)) return false;
  if (hasRecording || isDayComplete(dayNum, completed, assessments)) return true;
  if (isDayLocked(dayNum, completed, assessments, programStartDate, now, programDuration)) {
    return false;
  }
  if (dayNum === 1) return true;
  return isDayComplete(dayNum - 1, completed, assessments);
}

export function getSaveDayError(
  dayNum,
  completed,
  assessments = {},
  hasRecording = false,
  programStartDate,
  now = new Date(),
  programDuration = DEFAULT_PROGRAM_DAYS,
) {
  if (canSaveDay(dayNum, completed, assessments, hasRecording, programStartDate, now, programDuration)) {
    return null;
  }
  return (
    getDayLockMessage(dayNum, completed, assessments, programStartDate, now, programDuration) ||
    `You cannot save Day ${dayNum} yet.`
  );
}

export function getProgramStartDateFromUser(user) {
  if (user?.metadata?.creationTime) {
    return formatDateKey(new Date(user.metadata.creationTime));
  }
  return formatDateKey(new Date());
}
