import { SvgIcon, SvgIconProps } from '@mui/material';

// Horizontal bar used as the collapse ("hide") control glyph. Strokes with `currentColor` so the
// consumer sets the color. Cleaned from the Figma export (the stroke there was fg-3).
export const MinusIcon = ({ sx, ...rest }: SvgIconProps) => (
  <SvgIcon viewBox="0 0 18 18" fill="none" sx={sx} {...rest}>
    <path
      d="M3.59961 9.03662H14.3996"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
