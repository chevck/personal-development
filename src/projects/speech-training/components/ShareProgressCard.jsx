import { forwardRef, useMemo } from 'react';
import { getBranding } from '../../../config/branding';
import { SPEECH_TRAINING_PROJECT_ID } from '../../../config/projects';
import { DEFAULT_THEME_ID, getShareCardColors } from '../../../config/themePalette';

export const SHARE_CARD_WIDTH = 1080;
export const SHARE_CARD_HEIGHT = 1350;

const DISPLAY_FONT = '"Fraunces", Georgia, "Times New Roman", serif';
const BODY_FONT = '"Plus Jakarta Sans", system-ui, sans-serif';

const WAVE_HEIGHTS = [10, 22, 16, 30, 18, 26, 14, 32, 20, 24, 12, 18];

const TEXT = {
  block: {
    display: 'block',
    margin: 0,
    padding: 0,
    fontSynthesis: 'none',
    WebkitFontSmoothing: 'antialiased',
  },
};

function truncateText(text, maxLength) {
  const trimmed = text?.trim() ?? '';
  if (!trimmed || trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trim()}…`;
}

function ShareWaveform({ color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 36 }} aria-hidden>
      {WAVE_HEIGHTS.map((height, index) => (
        <span
          key={index}
          style={{
            display: 'block',
            width: 6,
            height,
            borderRadius: 999,
            background: `linear-gradient(to top, ${color}, ${color}88)`,
          }}
        />
      ))}
    </div>
  );
}

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
    themeId = DEFAULT_THEME_ID,
  },
  ref,
) {
  const branding = getBranding(SPEECH_TRAINING_PROJECT_ID);
  const colors = useMemo(() => getShareCardColors(themeId), [themeId]);

  const progressPct = Math.min(
    100,
    Math.round((completedCount / Math.max(programDuration, 1)) * 100),
  );

  const title = truncateText(day.title, 64);
  const description = truncateText(day.description, 150);
  const feedback = truncateText(assessorComment, 180);
  const note = truncateText(personalComment, 160);
  const assessorLabel = truncateText(assessorName, 36);
  const speakerLabel = truncateText(userName, 36);
  const dayLabel = String(day.day).padStart(2, '0');

  return (
    <div
      ref={ref}
      className="share-progress-card relative box-border select-none"
      style={{
        width: SHARE_CARD_WIDTH,
        height: SHARE_CARD_HEIGHT,
        fontFamily: BODY_FONT,
        background: colors.background,
        color: colors.ink,
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.55,
          background: colors.glow,
        }}
      />

      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 10,
          background: `linear-gradient(to bottom, ${colors.brand}, ${colors.brandHover})`,
        }}
      />

      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: 24,
          top: 96,
          fontFamily: DISPLAY_FONT,
          fontSize: 280,
          fontWeight: 600,
          lineHeight: '280px',
          color: colors.brand,
          opacity: 0.08,
          userSelect: 'none',
          fontOpticalSizing: 'auto',
        }}
      >
        {dayLabel}
      </div>

      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateRows: 'auto 1fr auto',
          height: SHARE_CARD_HEIGHT,
          padding: '64px 72px 72px 88px',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <img
              src={branding.logo}
              alt={branding.name}
              crossOrigin="anonymous"
              style={{ height: 48, width: 'auto', display: 'block', objectFit: 'contain' }}
            />
            <ShareWaveform color={colors.brand} />
          </div>
          <span
            style={{
              ...TEXT.block,
              borderRadius: 999,
              backgroundColor: colors.brand,
              color: colors.onBrand,
              padding: '12px 26px',
              fontSize: 20,
              fontWeight: 800,
              lineHeight: '24px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              boxShadow: `0 10px 28px ${colors.brand}44`,
            }}
          >
            Day {day.day} complete
          </span>
        </div>

        {/* Main content */}
        <div style={{ marginTop: 48, minHeight: 0, overflow: 'hidden' }}>
          <span
            style={{
              ...TEXT.block,
              fontSize: 18,
              fontWeight: 700,
              lineHeight: '22px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: colors.brand,
            }}
          >
            {day.type} · {phaseLabel}
          </span>

          <span
            style={{
              ...TEXT.block,
              marginTop: 16,
              fontFamily: DISPLAY_FONT,
              fontSize: 56,
              fontWeight: 600,
              lineHeight: '62px',
              fontOpticalSizing: 'auto',
              color: colors.ink,
              maxWidth: 860,
            }}
          >
            {title}
          </span>

          {description && (
            <span
              style={{
                ...TEXT.block,
                marginTop: 20,
                fontSize: 26,
                fontWeight: 500,
                lineHeight: '38px',
                color: colors.muted,
                maxWidth: 820,
              }}
            >
              {description}
            </span>
          )}

          {(feedback || score != null) && (
            <div
              style={{
                marginTop: 32,
                borderRadius: 24,
                padding: '24px 28px',
                backgroundColor: 'rgba(255,255,255,0.94)',
                border: `2px solid ${colors.brandRing}`,
                boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
              }}
            >
              <span
                style={{
                  ...TEXT.block,
                  fontSize: 16,
                  fontWeight: 700,
                  lineHeight: '20px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: colors.brandDark,
                }}
              >
                Assessor feedback
                {score != null ? ` · ${score}/10` : ''}
                {assessorLabel ? ` · ${assessorLabel}` : ''}
              </span>
              {feedback && (
                <span
                  style={{
                    ...TEXT.block,
                    marginTop: 12,
                    fontFamily: DISPLAY_FONT,
                    fontSize: 26,
                    fontWeight: 600,
                    fontStyle: 'italic',
                    lineHeight: '38px',
                    fontOpticalSizing: 'auto',
                    color: colors.ink,
                  }}
                >
                  &ldquo;{feedback}&rdquo;
                </span>
              )}
            </div>
          )}

          {note && (
            <div
              style={{
                marginTop: 24,
                borderRadius: 24,
                padding: '24px 28px',
                backgroundColor: colors.brand,
                color: colors.onBrand,
                boxShadow: `0 16px 40px ${colors.brand}40`,
              }}
            >
              <span
                style={{
                  ...TEXT.block,
                  fontSize: 16,
                  fontWeight: 700,
                  lineHeight: '20px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  opacity: 0.88,
                }}
              >
                {speakerLabel ? `${speakerLabel} says` : 'My note'}
              </span>
              <span
                style={{
                  ...TEXT.block,
                  marginTop: 12,
                  fontSize: 26,
                  fontWeight: 600,
                  lineHeight: '38px',
                }}
              >
                {note}
              </span>
            </div>
          )}
        </div>

        {/* Footer progress */}
        <div
          style={{
            marginTop: 40,
            borderRadius: 28,
            padding: '28px 32px',
            backgroundColor: 'rgba(255,255,255,0.94)',
            border: `2px solid ${colors.brandRing}`,
            boxShadow: '0 16px 48px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'end',
              columnGap: 24,
            }}
          >
            <div>
              <span
                style={{
                  ...TEXT.block,
                  fontSize: 16,
                  fontWeight: 700,
                  lineHeight: '20px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: colors.subtle,
                }}
              >
                Programme progress
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                  marginTop: 8,
                }}
              >
                <span
                  style={{
                    ...TEXT.block,
                    fontFamily: DISPLAY_FONT,
                    fontSize: 52,
                    fontWeight: 600,
                    lineHeight: '56px',
                    fontOpticalSizing: 'auto',
                    color: colors.ink,
                  }}
                >
                  {completedCount}
                </span>
                <span
                  style={{
                    ...TEXT.block,
                    fontSize: 26,
                    fontWeight: 600,
                    lineHeight: '32px',
                    color: colors.muted,
                  }}
                >
                  / {programDuration} days
                </span>
              </div>
            </div>
            <span
              style={{
                ...TEXT.block,
                fontFamily: DISPLAY_FONT,
                fontSize: 72,
                fontWeight: 600,
                lineHeight: '72px',
                fontOpticalSizing: 'auto',
                color: colors.brand,
              }}
            >
              {progressPct}%
            </span>
          </div>

          <div
            style={{
              marginTop: 20,
              height: 18,
              overflow: 'hidden',
              borderRadius: 999,
              backgroundColor: colors.progressTrack,
            }}
          >
            <div
              style={{
                height: 18,
                width: `${progressPct}%`,
                borderRadius: 999,
                background: colors.progressFill,
              }}
            />
          </div>

          <span
            style={{
              ...TEXT.block,
              marginTop: 18,
              fontSize: 18,
              fontWeight: 600,
              lineHeight: '24px',
              color: colors.subtle,
              textAlign: 'center',
              letterSpacing: '0.03em',
            }}
          >
            Speak with intention · Persona · Speakly
          </span>
        </div>
      </div>
    </div>
  );
});

export default ShareProgressCard;
