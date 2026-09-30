'use client';

import * as React from 'react';
import { Button } from './Button';

/**
 * Human-in-the-loop gate for tool calls the server marks
 * `requiresApproval`. Wire it to `useChat().submitApproval` via
 * {@link ToolApprovalProvider}, or pass `onApprove` / `onDeny` directly.
 */

interface ToolApprovalApi {
  submitApproval: (toolCallId: string, approved: boolean) => void | Promise<void>;
}

const ToolApprovalContext = React.createContext<ToolApprovalApi | null>(null);

/** Provides {@link ToolApproval} with the resolve callbacks (from `useChat`). */
export function ToolApprovalProvider({
  value,
  children,
}: {
  value: { submitApproval: (toolCallId: string, approved: boolean) => void | Promise<void> };
  children: React.ReactNode;
}) {
  const stable = React.useMemo(() => ({ submitApproval: value.submitApproval }), [value.submitApproval]);
  return <ToolApprovalContext.Provider value={stable}>{children}</ToolApprovalContext.Provider>;
}

/** Read the provider; throws if a ToolApproval renders without one and without props. */
export function useToolApproval(): ToolApprovalApi {
  const ctx = React.useContext(ToolApprovalContext);
  if (!ctx) throw new Error('ToolApproval requires ToolApprovalProvider or explicit onApprove/onDeny props');
  return ctx;
}

export interface ToolApprovalProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tool call id — forwarded to the resolver. */
  toolCallId: string;
  /** Tool display name. */
  toolName: string;
  /** Arguments to show the human before they decide. */
  input?: unknown;
  /** Current decision state (drives `data-status`). */
  state?: 'awaiting-approval' | 'approval-approved' | 'approval-denied';
  /** Direct approve handler (overrides the provider). */
  onApprove?: () => void | Promise<void>;
  /** Direct deny handler (overrides the provider). */
  onDeny?: () => void | Promise<void>;
  /** Render args as JSON. @defaultValue true */
  showArgs?: boolean;
}

export const ToolApproval = React.forwardRef<HTMLDivElement, ToolApprovalProps>(
  (
    {
      toolCallId,
      toolName,
      input,
      state = 'awaiting-approval',
      onApprove,
      onDeny,
      showArgs = true,
      className,
      ...rest
    },
    ref,
  ) => {
    const ctx = React.useContext(ToolApprovalContext);
    const pending = state === 'awaiting-approval';
    const resolvable = Boolean(ctx || (onApprove && onDeny));
    const statusText = pending ? 'waiting for your approval' : state === 'approval-approved' ? 'approved' : 'denied';

    const approve = async () => {
      if (onApprove) await onApprove();
      else if (ctx) await ctx.submitApproval(toolCallId, true);
    };
    const deny = async () => {
      if (onDeny) await onDeny();
      else if (ctx) await ctx.submitApproval(toolCallId, false);
    };

    const argsText =
      input == null ? '' : typeof input === 'string' ? input : JSON.stringify(input, null, 2);

    return (
      <div
        ref={ref}
        className={`sk-tool-approval${className ? ` ${className}` : ''}`}
        data-status={
          state === 'awaiting-approval' ? 'awaiting' : state === 'approval-approved' ? 'approved' : 'denied'
        }
        role="alertdialog"
        aria-label={`Approve ${toolName}`}
        {...(pending ? { 'aria-describedby': `sk-tool-approval-args-${toolCallId}` } : {})}
        {...rest}
      >
        <div className="sk-tool-approval__header">
          <span className="sk-tool-approval__icon" aria-hidden="true">
            ⚏
          </span>
          <span className="sk-tool-approval__title">{statusText}</span>
          <span className="sk-tool-approval__name">{toolName}</span>
        </div>
        {showArgs && argsText ? (
          <pre id={`sk-tool-approval-args-${toolCallId}`} className="sk-tool-approval__args">
            {argsText}
          </pre>
        ) : null}
        {pending ? (
          <div className="sk-tool-approval__body">
            <div className="sk-tool-approval__actions">
              <Button
                data-variant="ghost"
                data-size="sm"
                onClick={() => resolvable && void deny()}
                disabled={!resolvable}
                {...(!resolvable ? { title: 'Wrap in ToolApprovalProvider to resolve' as const } : {})}
              >
                Deny
              </Button>
              <Button
                data-variant="solid"
                data-size="sm"
                onClick={() => resolvable && void approve()}
                disabled={!resolvable}
                {...(!resolvable ? { title: 'Wrap in ToolApprovalProvider to resolve' as const } : {})}
              >
                Approve
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);

ToolApproval.displayName = 'ToolApproval';
