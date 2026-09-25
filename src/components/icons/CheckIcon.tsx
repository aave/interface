import { SvgIcon, SvgIconProps } from '@mui/material';

// The tick marking the active row in a settings submenu (selected language / theme). Strokes with
// `currentColor` so the consumer's `color` drives it — the menus set it to `purple-1`.
export const CheckIcon = ({ sx, ...rest }: SvgIconProps) => (
  <SvgIcon
    sx={[{ fill: 'none', stroke: 'currentColor' }, ...(Array.isArray(sx) ? sx : [sx])]}
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    <path
      d="M5.5 10.625L8.5 14.375L14.5 5.625"
      strokeWidth="1.875"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
