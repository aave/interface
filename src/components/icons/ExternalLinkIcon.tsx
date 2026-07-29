import { SvgIcon, SvgIconProps } from '@mui/material';

// External-link arrow (up-right) — the "opens in a new tab" affordance shown next to a link.
// Uses `currentColor` so it inherits the consumer's text color; in the nav it sits at fg-3 by
// default and brightens to fg-1 alongside the label on hover.
export const ExternalLinkIcon = ({ sx, ...rest }: SvgIconProps) => {
  return (
    <SvgIcon
      sx={[
        { fill: 'none', stroke: 'currentColor', color: 'inherit' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M4.60614 11.4267L11.3944 4.63847M5.70774 4.66825L11.3944 4.63847L11.3646 10.3251"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
};
