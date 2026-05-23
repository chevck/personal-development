export function getNextAllowedDay(completed) {
  for (let day = 1; day <= 21; day += 1) {
    if (!completed[day]) return day;
  }
  return null;
}

export function isDayLocked(dayNum, completed) {
  if (completed[dayNum]) return false;
  const next = getNextAllowedDay(completed);
  return next !== null && dayNum > next;
}

export function canSaveDay(dayNum, completed) {
  if (dayNum === 1) return true;
  if (completed[dayNum]) return true;
  return Boolean(completed[dayNum - 1]);
}
