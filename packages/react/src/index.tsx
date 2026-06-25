// @skeehn/react — React component wrappers for skeehn CSS components
// CSS is still imported separately from the engine + component CSS files

// Core components
export { Button } from './components/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/Button';

export { Card, CardHeader, CardTitle, CardBody, CardFooter } from './components/Card';
export type { CardProps, CardVariant, CardHeaderProps, CardTitleProps, CardBodyProps, CardFooterProps } from './components/Card';

export { Input, InputGroup } from './components/Input';
export type { InputProps, InputState, InputGroupProps } from './components/Input';

export { Badge } from './components/Badge';
export type { BadgeProps, BadgeVariant, BadgeColor } from './components/Badge';

export { Alert } from './components/Alert';
export type { AlertProps, AlertType } from './components/Alert';

export { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from './components/Dialog';
export type { DialogProps, DialogContentProps, DialogHeaderProps, DialogBodyProps, DialogFooterProps } from './components/Dialog';

export { Tabs } from './components/Tabs';
export type { TabsProps, TabItem } from './components/Tabs';

export { Toggle } from './components/Toggle';
export type { ToggleProps } from './components/Toggle';

export { Progress } from './components/Progress';
export type { ProgressProps, ProgressVariant, ProgressState } from './components/Progress';

export { Avatar } from './components/Avatar';
export type { AvatarProps, AvatarSize } from './components/Avatar';

export { Tooltip } from './components/Tooltip';
export type { TooltipProps } from './components/Tooltip';

export { Dropdown } from './components/Dropdown';
export type { DropdownProps, DropdownItem } from './components/Dropdown';

export { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from './components/Table';
export type { TableProps, TableHeadProps, TableBodyProps, TableRowProps, TableCellProps, TableHeaderCellProps } from './components/Table';

export { Accordion } from './components/Accordion';
export type { AccordionProps, AccordionItem } from './components/Accordion';

// AI components
export { ChatBubble, Message } from './components/ChatBubble';
export type { ChatBubbleProps, ChatBubbleRole } from './components/ChatBubble';

export { ChatInput } from './components/ChatInput';
export type { ChatInputProps, ChatInputState, ChatInputVariant } from './components/ChatInput';

export { ReasoningStep } from './components/ReasoningStep';
export type { ReasoningStepProps, ReasoningStepStatus } from './components/ReasoningStep';

export { AgentStatus } from './components/AgentStatus';
export type { AgentStatusProps, AgentStatusValue } from './components/AgentStatus';

export { ToolCard } from './components/ToolCard';
export type { ToolCardProps, ToolCardStatus } from './components/ToolCard';

export { CitationCard } from './components/CitationCard';
export type { CitationCardProps, CitationCardVariant } from './components/CitationCard';

export { StreamingText } from './components/StreamingText';
export type { StreamingTextProps, StreamingTextEffect, StreamingTextCaret } from './components/StreamingText';

export { TerminalPanel } from './components/TerminalPanel';
export type { TerminalPanelProps, TerminalPanelTheme } from './components/TerminalPanel';

export { CodeBlock } from './components/CodeBlock';
export type { CodeBlockProps } from './components/CodeBlock';

export { TypingIndicator } from './components/TypingIndicator';
export type { TypingIndicatorProps, TypingIndicatorVariant, TypingIndicatorSize } from './components/TypingIndicator';

export { Markdown } from './components/Markdown';
export type { MarkdownProps } from './components/Markdown';

export { VoiceSession } from './components/VoiceSession';
export type { VoiceSessionProps, VoiceSessionStatus, VoiceTranscriptTurn } from './components/VoiceSession';

export { ThinkingBlock } from './components/ThinkingBlock';
export type { ThinkingBlockProps, ThinkingBlockState } from './components/ThinkingBlock';

export { PromptSuggestions } from './components/PromptSuggestions';
export type { PromptSuggestionsProps, PromptSuggestionsVariant, PromptSuggestionItem } from './components/PromptSuggestions';

export { FileAttachment, FileAttachments } from './components/FileAttachment';
export type { FileAttachmentProps, FileAttachmentState, FileAttachmentsProps } from './components/FileAttachment';

// AI chat primitives (compose with @skeehn/react/ai or use standalone)
export { ScrollToBottomButton } from './components/ScrollToBottom';
export type { ScrollToBottomButtonProps } from './components/ScrollToBottom';

export { MessageActions } from './components/MessageActions';
export type { MessageActionsProps } from './components/MessageActions';

export { Sources } from './components/Sources';
export type { SourcesProps, SourceItem } from './components/Sources';

export { ModelPicker } from './components/ModelPicker';
export type { ModelPickerProps, ModelOption } from './components/ModelPicker';

// Layout bundle
export { Container, Grid, GridCell, Stack, StackDivider, Panel, Divider, Skeleton } from './components/Layout';
export type {
  ContainerProps, ContainerSize,
  GridProps, GridCols, GridCellProps,
  StackProps, StackDirection, StackGap, StackDividerProps,
  PanelProps,
  DividerProps, DividerVariant,
  SkeletonProps, SkeletonShape, SkeletonAnimate,
} from './components/Layout';

// Dataviz bundle
export { AsciiChart, Sparkline, Meter, Heatmap } from './components/Dataviz';
export type {
  AsciiChartProps, AsciiChartDataPoint,
  SparklineProps,
  MeterProps,
  HeatmapProps,
} from './components/Dataviz';

// Motion bundle
export { DitherPulse, AsciiRain, Glitch, TextureMask } from './components/Motion';
export type {
  DitherPulseProps, DitherPulseEffect,
  AsciiRainProps, AsciiRainDensity,
  GlitchProps, GlitchIntensity,
  TextureMaskProps, TextureMaskTrigger, TextureMaskDirection,
} from './components/Motion';

// Streaming-markdown utilities — make partial markdown safe to render mid-stream
export { closeOpenFences, hasOpenFence } from './lib/streaming-markdown';
