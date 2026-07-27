const publicUrl = process.env.PUBLIC_URL || '';

/** Provn burst mark — symbol for icon contexts, full wordmark for the logo. */
export const PERSONA_BRANDING = {
  id: 'persona',
  name: 'Provn',
  icon: `${publicUrl}/provn-symbol.svg`,
  logo: `${publicUrl}/provn-logo.svg`,
};

/** Per-project logos; projects without an entry use Provn branding. */
export const PROJECT_BRANDING = {
  'speech-training': {
    name: 'Speakly',
    icon: `${publicUrl}/speakly-icon.png`,
    logo: `${publicUrl}/speakly-logo.png`,
  },
};

export function getBranding(projectId) {
  if (projectId && PROJECT_BRANDING[projectId]) {
    return { id: projectId, ...PROJECT_BRANDING[projectId] };
  }
  return PERSONA_BRANDING;
}

export function getProjectBranding(projectId) {
  return getBranding(projectId);
}
