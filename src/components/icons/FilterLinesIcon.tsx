import { SvgIcon, SvgIconProps } from '@mui/material';

export const FilterLinesIcon = ({ sx, ...rest }: SvgIconProps) => (
  <SvgIcon
    sx={[{ fill: 'none', stroke: 'currentColor' }, ...(Array.isArray(sx) ? sx : [sx])]}
    viewBox="0 0 18 18"
    {...rest}
  >
    <path d="M3.6001 4.5H14.4001" strokeWidth="1.35" strokeLinecap="round" />
    <path d="M5.40015 9H12.6001" strokeWidth="1.35" strokeLinecap="round" />
    <path d="M7.20007 13.5H10.8001" strokeWidth="1.35" strokeLinecap="round" />
  </SvgIcon>
);
