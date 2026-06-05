/** Compact label for long URLs (copy/open still use the full URL). */
export function formatLongUrlDisplay(url, maxLength = 52) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const compact = `${parsed.host}${parsed.pathname}`;
    if (compact.length <= maxLength) return compact;
    return `${compact.slice(0, 24)}…${compact.slice(-20)}`;
  } catch {
    if (url.length <= maxLength) return url;
    return `${url.slice(0, 24)}…${url.slice(-20)}`;
  }
}

/** Short assess path, e.g. speakly.app/speakly/recordings/day-3/1 */
export function formatAssessLinkDisplay(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const speaklyMatch = parsed.pathname.match(/^\/speakly\/recordings\/(day-\d+)\/(\d+)$/i);
    if (speaklyMatch) {
      return `${parsed.host}/speakly/recordings/${speaklyMatch[1]}/${speaklyMatch[2]}`;
    }
    const speaklyWithCode = parsed.pathname.match(
      /^\/speakly\/recordings\/(\d{5})\/(day-\d+)\/(\d+)$/i,
    );
    if (speaklyWithCode) {
      return `${parsed.host}/speakly/recordings/${speaklyWithCode[2]}/${speaklyWithCode[3]}`;
    }
    const legacyMatch = parsed.pathname.match(/^\/(\d{5})\/(day-\d+)\/(recording-\d+)$/i);
    if (legacyMatch) {
      return `${parsed.host}/${legacyMatch[1]}/${legacyMatch[2]}/${legacyMatch[3]}`;
    }
  } catch {
    // fall through
  }
  return formatLongUrlDisplay(url);
}

/** Prefer storage path tail for recordings; otherwise truncate the download URL. */
export function formatRecordingLinkDisplay(url, storagePath) {
  if (storagePath) {
    const parts = storagePath.split('/').filter(Boolean);
    const tail = parts.slice(-3).join('/');
    if (tail) return tail;
  }
  return formatLongUrlDisplay(url);
}
