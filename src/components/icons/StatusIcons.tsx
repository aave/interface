import { SvgIcon, SvgIconProps } from '@mui/material';

// Status-chip glyphs for the `badge` Alert variant (CoW order states in transaction history).
// Same two-tone recipe as AlertIcons — a filled disc in `currentColor`, which the badge's icon box
// sets to the severity colour, with a fixed-white glyph on top. Rendered at 16×16.

const disc = <circle cx="8" cy="8" r="7" fill="currentColor" />;
const glyph = {
  stroke: '#fff',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
} as const;

// Each glyph is the same disc + one stroked path, so the shell is written once.
const statusIcon =
  (d: string, strokeWidth = '1.5') =>
  (props: SvgIconProps) =>
    (
      <SvgIcon viewBox="0 0 16 16" {...props}>
        {disc}
        <path d={d} strokeWidth={strokeWidth} {...glyph} />
      </SvgIcon>
    );

export const StatusInProgressIcon = statusIcon('M8.2002 12.5L8.20019 8.19949L5.9933 5.99259');
export const StatusFilledIcon = statusIcon('M4.7998 8.36172L6.81267 10.5617L11.1998 5.76172');
export const StatusCancelledIcon = statusIcon('M5.5 10.5L10.5 5.5M10.5 10.5L5.5 5.5', '1.6');
export const StatusExpiredIcon = statusIcon('M11.5 8.19922L8.20045 8.19787L8.20045 5.49838');
