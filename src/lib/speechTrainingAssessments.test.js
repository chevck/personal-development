import { matchPath } from 'react-router-dom';
import {
  buildSubmissionDocId,
  parseAssessPathSegments,
  resolveSubmissionDocId,
} from './speechTrainingAssessments';

describe('assessment share URLs', () => {
  test('react-router matches short assess path', () => {
    const match = matchPath(
      { path: '/:userCode/:daySegment/:recordingSegment', end: true },
      '/48291/day-3/recording-1'
    );
    expect(match?.params).toEqual({
      userCode: '48291',
      daySegment: 'day-3',
      recordingSegment: 'recording-1',
    });
  });

  test('parseAssessPathSegments', () => {
    expect(parseAssessPathSegments('48291', 'day-3', 'recording-1')).toEqual({
      shareCode: '48291',
      dayNum: 3,
      recordingNum: 1,
    });
    expect(parseAssessPathSegments('48291', 'day-3', 'bad')).toBeNull();
  });

  test('resolveSubmissionDocId from route segments', () => {
    expect(
      resolveSubmissionDocId({
        userCode: '48291',
        daySegment: 'day-3',
        recordingSegment: 'recording-1',
      })
    ).toBe(buildSubmissionDocId('48291', 3, 1));
  });
});
