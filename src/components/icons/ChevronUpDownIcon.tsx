import { SvgIcon, SvgIconProps } from '@mui/material';

// Double-chevron (up/down) dropdown indicator. Uses `currentColor` so the color
// comes from the consumer (e.g. a palette token via the `color` prop / sx).
export const ChevronUpDownIcon = ({ sx, ...rest }: SvgIconProps) => {
  return (
    <SvgIcon
      sx={{ fill: 'none', stroke: 'currentColor', ...sx }}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M6.3 11.7368L9 13.9868L11.7 11.7368"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.7 6.3L9 4.05L6.3 6.3"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
};
