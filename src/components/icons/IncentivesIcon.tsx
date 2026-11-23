import { SvgIcon, SvgIconProps } from '@mui/material';
import { figVars } from 'src/utils/figmaColors';

export const IncentivesIcon = ({ sx, ...rest }: SvgIconProps) => (
  <SvgIcon
    viewBox="0 0 20 20"
    sx={[
      {
        width: '1.25rem',
        height: '1.25rem',
        fill: 'none',
        strokeWidth: 1.5625,
        '& circle': { stroke: figVars['purple-1'] },
        '& path': { stroke: figVars['purple-2'] },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
    {...rest}
  >
    <circle cx="10" cy="10" r="8" />
    <path
      d="M5.69531 10.1022L6.80982 11.5174C7.3206 12.166 8.30872 12.1501 8.79832 11.4853L10.9864 8.51452C11.476 7.8498 12.4641 7.83385 12.9749 8.48243L14.3042 10.1703"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
