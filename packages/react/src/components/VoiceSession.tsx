'use client';

import React from 'react';

/** Voice session status. */
export type VoiceSessionStatus = 'idle' | 'listening' | 'transcribing' | 'speaking' | 'handoff';

/** A single transcript turn. */
export interface VoiceTranscriptTurn {
  /** Role of the speaker. */
  role: 'user' | 'assistant';
  /** Transcript text content. */
  text: string;
}

/** Number of placeholder waveform bars rendered when no `waveform` data is supplied. */
const DEFAULT_WAVEFORM_BARS = 8;

/** Props for the {@link VoiceSession} component. */
export interface VoiceSessionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current session status. */
  status?: VoiceSessionStatus;
  /** Elapsed time string (e.g. "00:42"). */
  clock?: string;
  /** Array of waveform bar heights (0-1 normalized). Omit to render animated placeholder bars. */
  waveform?: number[];
  /** Transcript turns. */
  transcript?: VoiceTranscriptTurn[];
  /** Accessible label for the region landmark. */
  label?: string;
  /** Called when the built-in Mute control is clicked. Renders the Mute button when provided. */
  onMute?: () => void;
  /** Called when the built-in End control is clicked. Renders the End button when provided. */
  onEnd?: () => void;
  /** Visible text for the Mute control. */
  muteLabel?: string;
  /** Visible text for the End control. */
  endLabel?: string;
  /** Additional CSS class names. */
  className?: string;
  /** Extra control elements rendered alongside the built-in Mute/End buttons. */
  children?: React.ReactNode;
}

/**
 * Realtime voice session with waveform, transcript, and state indicators.
 * Renders a `<div>` with `sk-voice-session` and `data-status`.
 *
 * The waveform animates via CSS (`@keyframes sk-voice-bar`) while
 * `status` is `listening` or `speaking` — no JavaScript ticking required.
 */
export const VoiceSession = React.forwardRef<HTMLDivElement, VoiceSessionProps>(
  (
    {
      status = 'idle',
      clock,
      waveform,
      transcript,
      label = 'Voice session',
      onMute,
      onEnd,
      muteLabel = 'Mute',
      endLabel = 'End',
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    // Render supplied bar heights, or a default set so the CSS animation has something to drive.
    const bars =
      waveform && waveform.length > 0
        ? waveform.map((h) => `${Math.max(2, h * 32)}px`)
        : Array.from({ length: DEFAULT_WAVEFORM_BARS }, () => undefined);
    const hasControls = Boolean(onMute || onEnd || children);

    return (
      <div
        ref={ref}
        className={`sk-voice-session${className ? ` ${className}` : ''}`}
        data-status={status}
        role="region"
        aria-label={label}
        {...rest}
      >
        {clock && <div className="sk-voice-session__clock">{clock}</div>}
        <div className="sk-voice-session__waveform" aria-hidden="true">
          {bars.map((height, i) => (
            <div
              key={i}
              className="sk-voice-session__waveform-bar"
              style={height ? { height } : undefined}
            />
          ))}
        </div>
        {transcript && transcript.length > 0 && (
          <div className="sk-voice-session__transcript" aria-live="polite">
            {transcript.map((turn, i) => (
              <div key={i} className="sk-voice-session__turn" data-role={turn.role}>
                {turn.text}
              </div>
            ))}
          </div>
        )}
        {hasControls && (
          <div className="sk-voice-session__controls">
            {onMute && (
              <button
                type="button"
                className="sk-voice-session__control"
                data-action="mute"
                onClick={onMute}
                aria-label="Mute microphone"
              >
                {muteLabel}
              </button>
            )}
            {onEnd && (
              <button
                type="button"
                className="sk-voice-session__control"
                data-action="end"
                onClick={onEnd}
                aria-label="End session"
              >
                {endLabel}
              </button>
            )}
            {children}
          </div>
        )}
      </div>
    );
  },
);

VoiceSession.displayName = 'VoiceSession';
