import { SvgIcon, SvgIconProps } from '@mui/material';

// Search / magnifying-glass icon. The lens is stroked and the handle is filled — both use
// `currentColor` so the color comes from the consumer (a palette token via `color` / sx).
export const SearchIcon = ({ sx, ...rest }: SvgIconProps) => {
  return (
    <SvgIcon
      sx={[{ fill: 'none' }, ...(Array.isArray(sx) ? sx : [sx])]}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M8.32505 13.725C11.3074 13.725 13.725 11.3074 13.725 8.32505C13.725 5.34271 11.3074 2.92505 8.32505 2.92505C5.34271 2.92505 2.92505 5.34271 2.92505 8.32505C2.92505 11.3074 5.34271 13.725 8.32505 13.725Z"
        stroke="currentColor"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.6773 15.4727C14.8969 15.6924 15.2531 15.6924 15.4727 15.4727C15.6924 15.2531 15.6924 14.8969 15.4727 14.6773L15.075 15.075L14.6773 15.4727ZM12.7727 11.9773L12.375 11.5795L11.5795 12.375L11.9773 12.7727L12.375 12.375L12.7727 11.9773ZM15.075 15.075L15.4727 14.6773L12.7727 11.9773L12.375 12.375L11.9773 12.7727L14.6773 15.4727L15.075 15.075Z"
        fill="currentColor"
      />
    </SvgIcon>
  );
};
