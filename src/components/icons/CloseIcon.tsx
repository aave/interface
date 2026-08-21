import { SvgIcon, SvgIconProps } from '@mui/material';

// Close (X) icon. Strokes with `currentColor` so it inherits the consumer's color
// (e.g. a palette token via `color`/sx).
export const CloseIcon = ({ sx, ...rest }: SvgIconProps) => (
  <SvgIcon
    sx={[{ fill: 'none', stroke: 'currentColor' }, ...(Array.isArray(sx) ? sx : [sx])]}
    viewBox="0 0 24 24"
    {...rest}
  >
    <path d="M18 6L6 18" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M6 6L18 18" strokeWidth="1.8" strokeLinecap="round" />
  </SvgIcon>
);
