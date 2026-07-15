import { SvgIcon, SvgIconProps } from '@mui/material';

// Swap / switch arrows. Strokes with `currentColor` so it inherits the consumer's color
// (e.g. a button's start-icon color, or a palette token via `color`/sx).
export const SwapIcon = ({ sx, ...rest }: SvgIconProps) => (
  <SvgIcon sx={{ fill: 'none', stroke: 'currentColor', ...sx }} viewBox="0 0 18 18" {...rest}>
    <path
      d="M1.66932 12.364L2.57397 8.98782L5.95018 9.89247"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.57397 8.98782L4.52753 12.1408C4.97016 12.9079 5.59991 13.5504 6.358 14.0083C7.1161 14.4662 7.97784 14.7246 8.86281 14.7594C9.74778 14.7941 10.6271 14.6042 11.4188 14.2072C12.2105 13.8102 12.8888 13.2191 13.3902 12.4891"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.7685 5.42152L14.8639 8.79773L11.4877 7.89308"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.04737 5.29591C4.54884 4.56591 5.22707 3.97484 6.01877 3.57785C6.81046 3.18086 7.68982 2.9909 8.57479 3.02568C9.45976 3.06046 10.3215 3.31886 11.0796 3.77676C11.8377 4.23466 12.4674 4.87714 12.9101 5.64425L14.8636 8.79722"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
