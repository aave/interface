import { SvgIcon, SvgIconProps } from '@mui/material';

export const CheckmarkIcon = ({ sx, ...rest }: SvgIconProps) => (
  <SvgIcon
    sx={[{ fill: 'none' }, ...(Array.isArray(sx) ? sx : [sx])]}
    viewBox="0 0 20 20"
    {...rest}
  >
    <path
      d="M4.5 11.1111L8.16667 15.6944L15.5 5"
      stroke="currentColor"
      strokeWidth="1.875"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
