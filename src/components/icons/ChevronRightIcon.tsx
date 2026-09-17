import { SvgIcon, SvgIconProps } from '@mui/material';

// Right-pointing chevron used as the forward/expand indicator on dropdown option rows
// (e.g. the settings "Language" row). Strokes with `currentColor` so the consumer's
// `color` drives it — which keeps it Display-P3 capable (the token resolves to a CSS
// var, and `var()` works in the `color` property even though not in SVG attributes).
export const ChevronRightIcon = ({ sx, ...rest }: SvgIconProps) => (
  <SvgIcon
    sx={[{ fill: 'none', stroke: 'currentColor' }, ...(Array.isArray(sx) ? sx : [sx])]}
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    <path
      d="M8 5.04089L13.0526 10.0409L8 15.0409"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
