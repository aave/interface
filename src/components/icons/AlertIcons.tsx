import { SvgIcon, SvgIconProps } from '@mui/material';

// Two-tone alert severity icons: a filled shape in `currentColor` (the severity color, set by the
// Alert's icon box) with a fixed-white glyph on top. Rendered at 20×20 inside the alert icon box.

export const AlertInfoIcon = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 20 20" {...props}>
    <path
      d="M10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18Z"
      fill="currentColor"
    />
    <circle cx="10" cy="6.5" r="1.5" fill="#fff" />
    <path d="M10 10V14" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
  </SvgIcon>
);

export const AlertWarningIcon = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 20 20" {...props}>
    <path
      d="M8.26813 3.68164C9.03793 2.34831 10.9622 2.34831 11.732 3.68164L17.7945 14.1816C18.5641 15.5149 17.6016 17.1816 16.0621 17.1816H3.93805C2.3985 17.1816 1.43597 15.5149 2.20563 14.1816L8.26813 3.68164Z"
      fill="currentColor"
    />
    <path d="M10 6V10" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
    <circle cx="10" cy="13.5" r="1.5" fill="#fff" />
  </SvgIcon>
);

export const AlertSuccessIcon = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 20 20" {...props}>
    <path
      d="M10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18Z"
      fill="currentColor"
    />
    <path
      d="M6.5 10.25L8.75 12.5L13.5 7.5"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

export const AlertErrorIcon = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 20 20" {...props}>
    <path
      d="M10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18Z"
      fill="currentColor"
    />
    <path
      d="M7.5 7.5L12.5 12.5M12.5 7.5L7.5 12.5"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </SvgIcon>
);
