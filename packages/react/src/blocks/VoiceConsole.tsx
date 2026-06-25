'use client';

/**
 * @module @skeehn/react/blocks — VoiceConsole
 *
 * A framed voice-agent surface: a header (title + live status), the animated
 * <VoiceSession> (waveform · transcript · mute/end controls), and an optional
 * hint footer. A ready-to-drop-in voice console.
 */
import * as React from 'react';
import { VoiceSession, type VoiceSessionProps, type VoiceSessionStatus } from '../components/VoiceSession';

const STATUS_LABEL: Record<VoiceSessionStatus, string> = {
  idle: 'Idle',
  listening: 'Listening',
  transcribing: 'Transcribing',
  speaking: 'Speaking',
  handoff: 'Handoff',
};

export interface VoiceConsoleProps extends VoiceSessionProps {
  /** Header title. @defaultValue "Voice" */
  title?: string;
  /** Hint text shown in the footer. */
  hint?: string;
}

/** A framed voice-agent console wrapping <VoiceSession>. */
export const VoiceConsole = React.forwardRef<HTMLDivElement, VoiceConsoleProps>(function VoiceConsole(
  { title = 'Voice', hint, status = 'idle', className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={`sk-voice-console${className ? ` ${className}` : ''}`}>
      <header className="sk-voice-console__header">
        <span className="sk-voice-console__title">{title}</span>
        <span className="sk-voice-console__status" data-status={status}>{STATUS_LABEL[status]}</span>
      </header>
      <div className="sk-voice-console__body">
        <VoiceSession status={status} {...rest} />
      </div>
      {hint && <footer className="sk-voice-console__hint">{hint}</footer>}
    </div>
  );
});
