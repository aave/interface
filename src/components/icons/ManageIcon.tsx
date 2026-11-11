import { SvgIcon, SvgIconProps } from '@mui/material';

// Two-slider "manage" glyph (Aave Pro's display-settings trigger). Uses `currentColor` so the
// color comes from the consumer.
export const ManageIcon = ({ sx, ...rest }: SvgIconProps) => {
  return (
    <SvgIcon
      sx={[{ fill: 'none', stroke: 'currentColor' }, ...(Array.isArray(sx) ? sx : [sx])]}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M12.75 14.2909C12.75 13.0483 13.7574 12.0409 15 12.0409C16.2426 12.0409 17.25 13.0483 17.25 14.2909C17.25 15.5335 16.2426 16.5409 15 16.5409C13.7574 16.5409 12.75 15.5335 12.75 14.2909ZM12.75 14.2909L4.75 14.2909"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.25 6.29089C7.25 7.53354 6.24264 8.54089 5 8.54089C3.75736 8.54089 2.75 7.53353 2.75 6.29089C2.75 5.04825 3.75736 4.04089 5 4.04089C6.24264 4.04089 7.25 5.04825 7.25 6.29089ZM7.25 6.29089L15.25 6.2909"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </SvgIcon>
  );
};
