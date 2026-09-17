import { SvgIcon, SvgIconProps } from '@mui/material';
import { figVars } from 'src/utils/figmaColors';

// Double-chevron (up/down) dropdown indicator. Uses `currentColor` so the color
// comes from the consumer (e.g. a palette token via the `color` prop / sx).
export const ChevronDownIcon = ({ sx, ...rest }: SvgIconProps) => {
  return (
    <SvgIcon
      sx={[{ fill: 'none', stroke: 'currentColor' }, ...(Array.isArray(sx) ? sx : [sx])]}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M12 6.39062L8 10.4327L4 6.39062"
        stroke={figVars['fg-3']}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
};
