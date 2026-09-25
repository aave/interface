import { SvgIcon, SvgIconProps } from '@mui/material';

// Back / collapse chevron for the settings submenus. A wider angle than `ChevronRightIcon`
// mirrored (an 8-unit rise over the same 5-unit run, in an 18 viewBox), so it gets its own path
// rather than a rotation. Strokes with `currentColor`, like every other UI icon.
export const ChevronLeftIcon = ({ sx, ...rest }: SvgIconProps) => (
  <SvgIcon
    sx={[{ fill: 'none', stroke: 'currentColor' }, ...(Array.isArray(sx) ? sx : [sx])]}
    viewBox="0 0 18 18"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    <path
      d="M11 13.0327L5.94737 9.03271L11 5.03271"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
