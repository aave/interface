import { SvgIcon, SvgIconProps } from '@mui/material';

export const PercentIcon = ({ sx, ...rest }: SvgIconProps) => (
  <SvgIcon
    viewBox="0 0 20 20"
    sx={[
      { fontSize: '1.25rem', fill: 'none', stroke: 'currentColor' },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
    {...rest}
  >
    <path d="M14 5L6 15" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="13.25" cy="13.25" r="2" strokeWidth="1.25" />
    <circle cx="6.75" cy="6.75" r="2" strokeWidth="1.25" />
  </SvgIcon>
);
