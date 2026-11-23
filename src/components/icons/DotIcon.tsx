import { SvgIcon, SvgIconProps } from '@mui/material';

export const DotIcon = ({ sx, ...rest }: SvgIconProps) => (
  <SvgIcon
    viewBox="0 0 3 3"
    sx={[{ width: 3, height: 3 }, ...(Array.isArray(sx) ? sx : [sx])]}
    {...rest}
  >
    <circle cx="1.5" cy="1.5" r="1.5" />
  </SvgIcon>
);
