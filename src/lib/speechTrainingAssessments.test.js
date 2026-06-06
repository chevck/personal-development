import { matchPath } from 'react-router-dom';
import {
  buildAssessPath,
  buildAssessUrl,
  buildSubmissionDocId,
  parseAssessPathSegments,
  parseSpeaklyRecordingPath,
  resolveSubmissionDocId,
  submissionAcceptsReview,
} from './speechTrainingAssessments';

describe('assessment share URLs', () => {
  test('react-router matches speakly recording path', () => {
    const match = matchPath(
      { path: '/speakly/recordings/:daySegment/:recordingNum', end: true },
      '/speakly/recordings/day-3/2',
    );
    expect(match?.params).toEqual({
      daySegment: 'day-3',
      recordingNum: '2',
    });
  });

  test('parseSpeaklyRecordingPath', () => {
    expect(parseSpeaklyRecordingPath('day-3', '2', '48291')).toEqual({
      shareCode: '48291',
      dayNum: 3,
      recordingNum: 2,
    });
    expect(parseSpeaklyRecordingPath('day-3', '2', 'bad')).toBeNull();
  });

  test('buildAssessUrl uses speakly recordings path', () => {
    const url = new URL(buildAssessUrl('48291', 3, 2));
    expect(url.pathname).toBe('/speakly/recordings/day-3/2');
    expect(url.searchParams.get('c')).toBe('48291');
  });

  test('buildAssessPath', () => {
    expect(buildAssessPath('48291', 3, 2)).toBe('/speakly/recordings/day-3/2?c=48291');
  });

  test('resolveSubmissionDocId from speakly route', () => {
    expect(
      resolveSubmissionDocId({
        daySegment: 'day-3',
        recordingNum: '2',
        shareCode: '48291',
      }),
    ).toBe(buildSubmissionDocId('48291', 3, 2));
  });

  test('react-router matches legacy assess path', () => {
    const match = matchPath(
      { path: '/:userCode/:daySegment/:recordingSegment', end: true },
      '/48291/day-3/recording-1',
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

  test('submissionAcceptsReview for playback and pending only', () => {
    expect(submissionAcceptsReview({ status: 'playback' })).toBe(true);
    expect(submissionAcceptsReview({ status: 'pending' })).toBe(true);
    expect(submissionAcceptsReview({ status: 'reviewed' })).toBe(false);
    expect(submissionAcceptsReview({ status: 'superseded' })).toBe(false);
  });

  test('resolveSubmissionDocId from legacy route segments', () => {
    expect(
      resolveSubmissionDocId({
        userCode: '48291',
        daySegment: 'day-3',
        recordingSegment: 'recording-1',
      }),
    ).toBe(buildSubmissionDocId('48291', 3, 1));
  });
});
