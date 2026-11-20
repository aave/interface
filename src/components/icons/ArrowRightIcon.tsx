import { SvgIcon, SvgIconProps } from '@mui/material';

export const ArrowRightIcon = ({ sx, ...rest }: SvgIconProps) => (
  <SvgIcon
    viewBox="0 0 10 8"
    sx={[
      {
        width: '0.625rem',
        height: '0.5rem',
        fill: 'none',
        stroke: 'currentColor',
        color: 'fg-icon',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
    {...rest}
  >
    <path
      d="M0.75 3.75H9M6 6.75L9 3.75L6 0.75"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
