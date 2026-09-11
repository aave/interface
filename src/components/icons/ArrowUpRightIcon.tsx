import { SvgIcon, SvgIconProps } from '@mui/material';

// Up-right diagonal arrow — the "opens in a new tab / external" affordance shown next to a link.
// Uses `currentColor` and inherits `color` from the consumer, so a palette token set via
// `color`/`sx` on the parent (e.g. `purple-2`) flows straight through to the stroke. (A CSS var
// can't be passed to an SVG `stroke` attribute directly, so color must arrive as `currentColor`.)
export const ArrowUpRightIcon = ({ sx, ...rest }: SvgIconProps) => {
  return (
    <SvgIcon
      sx={[
        { fill: 'none', stroke: 'currentColor', color: 'inherit' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M4.60517 11.4267L11.3934 4.63847M5.70676 4.66825L11.3934 4.63847L11.3636 10.3251"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
};
