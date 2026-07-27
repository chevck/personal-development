import {
  PERSONA_DESIGN_DISCIPLINES,
  PERSONA_DESIGN_FOCUS_AREAS,
  PERSONA_TRACK_DESIGN,
} from "./personaRegistration";

/** Skills with a question-driven "add a skill" setup flow (vs. full account registration). */
export const SKILLS_WITH_GUIDED_SETUP = new Set([PERSONA_TRACK_DESIGN]);

const DESIGN_TASK_VERBS = [
  "Sketch",
  "Design",
  "Redesign",
  "Prototype",
  "Critique",
  "Refine",
  "Explore",
  "Build",
];

const DESIGN_TASK_SUBJECTS = [
  "a mobile app onboarding flow",
  "a landing page hero section",
  "a product icon set",
  "a pricing page layout",
  "a dashboard widget",
  "a book cover",
  "a poster for a local event",
  "a social media carousel",
  "a login screen",
  "a settings page",
  "an empty state illustration",
  "a navigation menu",
];

function labelsForIds(ids, bank) {
  const byId = Object.fromEntries(
    bank.map((option) => [option.id, option.label]),
  );
  return ids.map((id) => byId[id]).filter(Boolean);
}

/** Falls back to every non-"Other" option in the bank when nothing usable was selected. */
function resolveLabels(ids, bank) {
  const selected = labelsForIds(ids, bank).filter((label) => label !== "Other");
  if (selected.length > 0) return selected;
  return bank
    .filter((option) => option.id !== "other")
    .map((option) => option.label);
}

/**
 * Deterministically builds a day-by-day task list from a learner's
 * questionnaire answers. There is no task-generation backend for the design
 * track yet, so this stands in for one—templated but varied enough to feel
 * personal, and stable across re-renders for the same answers.
 */
export function generateSkillTasks({
  skillId,
  disciplines = [],
  focusAreas = [],
  programDuration,
}) {
  console.log({ skillId });
  if (skillId !== PERSONA_TRACK_DESIGN) return [];

  const disciplineLabels = resolveLabels(
    disciplines,
    PERSONA_DESIGN_DISCIPLINES,
  );
  console.log({ disciplineLabels });
  const focusLabels = resolveLabels(focusAreas, PERSONA_DESIGN_FOCUS_AREAS);
  console.log({ focusLabels });
  const duration = Math.max(1, Math.round(programDuration) || 1);

  const tasks = [];
  for (let day = 1; day <= duration; day += 1) {
    const discipline = disciplineLabels[(day - 1) % disciplineLabels.length];

    const focus = focusLabels[(day - 1) % focusLabels.length];
    const verb = DESIGN_TASK_VERBS[(day - 1) % DESIGN_TASK_VERBS.length];
    const subject =
      DESIGN_TASK_SUBJECTS[(day - 1) % DESIGN_TASK_SUBJECTS.length];
    console.log({ discipline, focus, verb, subject });

    tasks.push({
      day,
      title: `${verb} ${subject}`,
      description: `A ${discipline.toLowerCase()} exercise focused on ${focus.toLowerCase()}. Spend 20–40 minutes, then submit for assessor feedback.`,
      disciplineLabel: discipline,
      focusLabel: focus,
      completed: false,
      completedAt: null,
    });
  }

  console.log({ tasks });

  return tasks;
}
