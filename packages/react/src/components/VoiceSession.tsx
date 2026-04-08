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

/** Props for the {@link VoiceSession} component. */
export interface VoiceSessionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current session status. */
  status?: VoiceSessionStatus;
  /** Elapsed time string (e.g. "00:42"). */
  clock?: string;
  /** Array of waveform bar heights (0-1 normalized). */
  waveform?: number[];
  /** Transcript turns. */
  transcript?: VoiceTranscriptTurn[];
  /** Additional CSS class names. */
  className?: string;
  /** Control elements rendered at the bottom. */
  children?: React.ReactNode;
}

/**
 * Realtime voice session with waveform, transcript, and state indicators.
 * Renders a `<div>` with `sk-voice-session` and `data-status`.
 */
export const VoiceSession = React.forwardRef<HTMLDivElement, VoiceSessionProps>(
  ({ status = 'idle', clock, waveform, transcript, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={`sk-voice-session${className ? ` ${className}` : ''}`}
      data-status={status}
      {...rest}
    >
      {clock && <div className="sk-voice-session__clock">{clock}</div>}
      {waveform && waveform.length > 0 && (
        <div className="sk-voice-session__waveform">
          {waveform.map((h, i) => (
            <div
              key={i}
              className="sk-voice-session__waveform-bar"
              style={{ height: `${Math.max(2, h * 32)}px` }}
            />
          ))}
        </div>
      )}
      {transcript && transcript.length > 0 && (
        <div className="sk-voice-session__transcript">
          {transcript.map((turn, i) => (
            <div key={i} className="sk-voice-session__turn" data-role={turn.role}>
              {turn.text}
            </div>
          ))}
        </div>
      )}
      {children && <div className="sk-voice-session__controls">{children}</div>}
    </div>
  ),
);

VoiceSession.displayName = 'VoiceSession';
