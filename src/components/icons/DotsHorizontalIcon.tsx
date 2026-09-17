import { SvgIcon, SvgIconProps } from '@mui/material';

// Horizontal three-dot ("more" / meatball) menu icon. Fills with `currentColor` so it
// inherits the consumer's color (e.g. a palette token via the `color` prop / sx) — which
// is also what makes it Display-P3 capable, since the token resolves to a CSS var.
export const DotsHorizontalIcon = ({ sx, ...rest }: SvgIconProps) => (
  <SvgIcon
    sx={[{ fill: 'currentColor' }, ...(Array.isArray(sx) ? sx : [sx])]}
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    <circle cx="5" cy="10" r="1.25" />
    <circle cx="10" cy="10" r="1.25" />
    <circle cx="15" cy="10" r="1.25" />
  </SvgIcon>
);
