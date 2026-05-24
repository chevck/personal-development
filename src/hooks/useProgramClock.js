import { useEffect, useState } from 'react';

/** Current time, refreshed at each local midnight so calendar day locks update. */
export function useProgramClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - Date.now();

    const timeoutId = setTimeout(() => setNow(new Date()), msUntilMidnight + 500);
    return () => clearTimeout(timeoutId);
  }, [now]);

  return now;
}
