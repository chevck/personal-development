import { phases } from '../projects/speech-training/phases';

export const MIN_PROGRAM_DAYS = 7;
export const MAX_PROGRAM_DAYS = 60;
export const DEFAULT_PROGRAM_DAYS = 21;
export const CURRICULUM_LENGTH = 21;

const curriculumDays = phases.flatMap((p) => p.days);

export function normalizeProgramDuration(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_PROGRAM_DAYS;
  return Math.min(
    MAX_PROGRAM_DAYS,
    Math.max(MIN_PROGRAM_DAYS, Math.round(n)),
  );
}

/** Exercise content for programme day N (cycles after 21 curriculum days). */
export function getCurriculumDay(dayNum) {
  const idx = (Math.max(1, dayNum) - 1) % CURRICULUM_LENGTH;
  const template = curriculumDays[idx];
  return { ...template, day: dayNum };
}

export function getPhaseForWeekIndex(weekIndex) {
  return phases[Math.min(weekIndex, phases.length - 1)];
}

export function getProgramWeeks(programDuration) {
  const duration = normalizeProgramDuration(programDuration);
  const weekCount = Math.ceil(duration / 7);
  const weeks = [];

  for (let w = 0; w < weekCount; w += 1) {
    const startDay = w * 7 + 1;
    const endDay = Math.min(startDay + 6, duration);
    weeks.push({
      weekIndex: w,
      startDay,
      endDay,
      subtitle: `Days ${startDay}–${endDay}`,
      phase: getPhaseForWeekIndex(w),
      days: getDaysInWeek(w, duration),
    });
  }

  return weeks;
}

export function getDaysInWeek(weekIndex, programDuration) {
  const duration = normalizeProgramDuration(programDuration);
  const startDay = weekIndex * 7 + 1;
  const endDay = Math.min(startDay + 6, duration);
  const days = [];

  for (let d = startDay; d <= endDay; d += 1) {
    days.push(getCurriculumDay(d));
  }

  return days;
}

export function findDayInProgram(dayNum, programDuration) {
  const duration = normalizeProgramDuration(programDuration);
  if (dayNum < 1 || dayNum > duration) return null;
  const weekIndex = Math.floor((dayNum - 1) / 7);
  return {
    day: getCurriculumDay(dayNum),
    phase: getPhaseForWeekIndex(weekIndex),
  };
}

export function isDayInProgram(dayNum, programDuration) {
  const duration = normalizeProgramDuration(programDuration);
  return dayNum >= 1 && dayNum <= duration;
}
