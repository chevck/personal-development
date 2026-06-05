const publicUrl = process.env.PUBLIC_URL || '';

/** Sculpture mark on black — icon and logo use the same asset. */
export const PERSONA_BRANDING = {
  id: 'persona',
  name: 'Persona',
  icon: `${publicUrl}/persona-icon.png`,
  logo: `${publicUrl}/persona-logo.png`,
};

/** Per-project logos; projects without an entry use Persona branding. */
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
