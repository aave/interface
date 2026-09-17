import { SvgIcon, SvgIconProps } from '@mui/material';

// Minimal wallet outline (rounded body + card-slot line) — the "add token to wallet" affordance in
// the reserve header. Uses `currentColor` so the consumer's `color` (e.g. a palette token via `sx`)
// flows straight to the stroke, matching the sibling icons (ArrowUpRightIcon, ChevronUpDownIcon).
export const WalletOutlineIcon = ({ sx, ...rest }: SvgIconProps) => {
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
        d="M14.3999 11.2307L14.3999 4.39995C14.3999 3.29538 13.5045 2.39995 12.3999 2.39995L3.59991 2.39995C2.49534 2.39995 1.59991 3.29538 1.59991 4.39995L1.59991 11.2307C1.59991 12.3353 2.49534 13.2307 3.59991 13.2307L12.3999 13.2307C13.5045 13.2307 14.3999 12.3353 14.3999 11.2307Z"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.6001 6.3999H5.55257C5.57882 6.3999 5.6001 6.42118 5.6001 6.44743C5.6001 7.74666 6.65334 8.7999 7.95257 8.7999H8.04803C9.34704 8.7999 10.4001 7.74684 10.4001 6.44783C10.4001 6.42143 10.4216 6.40009 10.448 6.40032L14.4001 6.43435"
        strokeWidth="1.35"
      />
    </SvgIcon>
  );
};
