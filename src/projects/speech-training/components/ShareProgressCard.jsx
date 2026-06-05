import { forwardRef } from 'react';
import AppLogo from '../../../components/AppLogo';
import { SPEECH_TRAINING_PROJECT_ID } from '../../../config/projects';

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1080;

const ShareProgressCard = forwardRef(function ShareProgressCard(
  {
    day,
    phaseLabel,
    personalComment,
    assessorComment,
    assessorName,
    score,
    programDuration,
    completedCount,
    userName,
  },
  ref,
) {
  const progressPct = Math.round((completedCount / programDuration) * 100);

  return (
    <div
      ref={ref}
      className="share-progress-card relative pointer-events-none select-none overflow-hidden"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        background: 'linear-gradient(145deg, #fff4f0 0%, #ffffff 42%, #f5d5cb 100%)',
      }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at 85% 15%, rgba(217,93,57,0.35), transparent 45%), radial-gradient(circle at 10% 90%, rgba(217,93,57,0.2), transparent 40%)',
        }}
        aria-hidden
      />

      <div className="relative flex h-full flex-col p-16">
        <div className="flex items-center justify-between">
          <AppLogo projectId={SPEECH_TRAINING_PROJECT_ID} variant="logo" size="md" />
          <span
            style={{
              borderRadius: 999,
              backgroundColor: '#D95D39',
              color: '#fff',
              padding: '12px 24px',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Day {day.day} complete
          </span>
        </div>

        <div className="mt-14">
          <p
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#D95D39',
            }}
          >
            {day.type} · {phaseLabel}
          </p>
          <h2
            style={{
              marginTop: 16,
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.08,
              color: '#1C1C1C',
              maxWidth: 900,
            }}
          >
            {day.title}
          </h2>
          <p style={{ marginTop: 20, fontSize: 28, color: '#6B6578', lineHeight: 1.5 }}>
            {day.description}
          </p>
        </div>

        {(assessorComment || score != null) && (
          <div
            className="mt-10 rounded-3xl p-8"
            style={{ backgroundColor: 'rgba(255,255,255,0.85)', border: '2px solid #F0C4B8' }}
          >
            <p
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#9E3D24',
              }}
            >
              Assessor feedback
              {score != null ? ` · ${score}/10` : ''}
              {assessorName ? ` · ${assessorName}` : ''}
            </p>
            {assessorComment && (
              <p
                style={{
                  marginTop: 12,
                  fontSize: 28,
                  fontStyle: 'italic',
                  lineHeight: 1.45,
                  color: '#30261E',
                }}
              >
                &ldquo;{assessorComment}&rdquo;
              </p>
            )}
          </div>
        )}

        {personalComment?.trim() && (
          <div
            className="mt-8 rounded-3xl p-8"
            style={{ backgroundColor: '#D95D39', color: '#fff' }}
          >
            <p
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                opacity: 0.85,
              }}
            >
              {userName ? `${userName} says` : 'My note'}
            </p>
            <p style={{ marginTop: 12, fontSize: 30, lineHeight: 1.45, fontWeight: 600 }}>
              {personalComment.trim()}
            </p>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-end justify-between gap-8">
            <div>
              <p style={{ fontSize: 22, fontWeight: 600, color: '#6B6578' }}>Programme progress</p>
              <p style={{ marginTop: 8, fontSize: 52, fontWeight: 800, color: '#1C1C1C' }}>
                {completedCount}
                <span style={{ fontSize: 32, fontWeight: 600, color: '#6B6578' }}>
                  {' '}
                  / {programDuration} days
                </span>
              </p>
            </div>
            <p style={{ fontSize: 72, fontWeight: 800, color: '#D95D39' }}>{progressPct}%</p>
          </div>
          <div
            className="mt-6 overflow-hidden rounded-full"
            style={{ height: 20, backgroundColor: '#F0C4B8' }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPct}%`,
                borderRadius: 999,
                background: 'linear-gradient(90deg, #D95D39, #C24E2F)',
              }}
            />
          </div>
          <p style={{ marginTop: 20, fontSize: 22, color: '#8A8A8A' }}>
            Training with intention · Persona · Speakly
          </p>
        </div>
      </div>
    </div>
  );
});

export default ShareProgressCard;
