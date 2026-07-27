import { generateSkillTasks } from '../../src/config/personaSkillTasks';
import { PERSONA_TRACK_DESIGN } from '../../src/config/personaRegistration';

test('generates one task per day for the requested duration', () => {
  const tasks = generateSkillTasks({
    skillId: PERSONA_TRACK_DESIGN,
    disciplines: ['ui-ux'],
    focusAreas: ['layout'],
    programDuration: 10,
  });

  expect(tasks).toHaveLength(10);
  expect(tasks.map((t) => t.day)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  tasks.forEach((task) => {
    expect(task.completed).toBe(false);
    expect(task.completedAt).toBeNull();
    expect(task.title).toEqual(expect.any(String));
    expect(task.description).toEqual(expect.any(String));
  });
});

test('rotates through the selected disciplines and focus areas', () => {
  const tasks = generateSkillTasks({
    skillId: PERSONA_TRACK_DESIGN,
    disciplines: ['ui-ux', 'graphics'],
    focusAreas: ['layout', 'color'],
    programDuration: 4,
  });

  expect(tasks[0].disciplineLabel).toBe('UI/UX design');
  expect(tasks[1].disciplineLabel).toBe('Graphics design');
  expect(tasks[2].disciplineLabel).toBe('UI/UX design');
  expect(tasks[3].disciplineLabel).toBe('Graphics design');
});

test('falls back to the full option bank when nothing usable was selected', () => {
  const tasks = generateSkillTasks({
    skillId: PERSONA_TRACK_DESIGN,
    disciplines: ['other'],
    focusAreas: ['other'],
    programDuration: 3,
  });

  expect(tasks).toHaveLength(3);
  tasks.forEach((task) => {
    expect(task.disciplineLabel).not.toBe('Other');
    expect(task.focusLabel).not.toBe('Other');
  });
});

test('returns an empty list for skills without a generator', () => {
  expect(
    generateSkillTasks({ skillId: 'voice', disciplines: [], focusAreas: [], programDuration: 21 }),
  ).toEqual([]);
});
