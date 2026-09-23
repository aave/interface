import { SvgIcon, SvgIconProps } from '@mui/material';
import { useId } from 'react';

// The three theme-mode glyphs for the settings menu's Theme submenu. All stroke/fill with
// `currentColor` so the row's icon slot drives the color (fg-3), like every other menu icon.

export const ThemeSystemIcon = ({ sx, ...rest }: SvgIconProps) => (
  <SvgIcon
    sx={[{ fill: 'none', stroke: 'currentColor' }, ...(Array.isArray(sx) ? sx : [sx])]}
    viewBox="0 0 18 18"
    {...rest}
  >
    <rect
      x="2.59998"
      y="3.39844"
      width="12.8"
      height="8.8"
      rx="2"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M5.19995 15H12.8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </SvgIcon>
);

// The sun's eight rays, as their Figma-exported centres — each a dot of the same radius. Built
// once at import: the markup is fixed, so there's nothing to recompute per render.
const RAYS = [
  { cx: '15.035', cy: '8.99876' },
  { cx: '13.2674', cy: '4.73438', transform: 'rotate(-45 13.2674 4.73438)' },
  { cx: '9.0001', cy: '2.96609', transform: 'rotate(-90 9.0001 2.96609)' },
  { cx: '4.73254', cy: '4.73175', transform: 'rotate(-135 4.73254 4.73175)' },
  { cx: '2.96494', cy: '8.99876' },
  { cx: '4.7326', cy: '13.2656', transform: 'rotate(-45 4.7326 13.2656)' },
  { cx: '9.0001', cy: '15.0364', transform: 'rotate(-90 9.0001 15.0364)' },
  { cx: '13.2673', cy: '13.2669', transform: 'rotate(-135 13.2673 13.2669)' },
].map((ray) => (
  <circle key={`${ray.cx}-${ray.cy}`} {...ray} r="1.13157" fill="currentColor" stroke="none" />
));

export const ThemeLightIcon = ({ sx, ...rest }: SvgIconProps) => (
  <SvgIcon
    sx={[{ fill: 'none', stroke: 'currentColor' }, ...(Array.isArray(sx) ? sx : [sx])]}
    viewBox="0 0 18 18"
    {...rest}
  >
    <circle cx="8.99997" cy="8.99875" r="2.88938" strokeWidth="1.6" />
    {RAYS}
  </SvgIcon>
);

export const ThemeDarkIcon = ({ sx, ...rest }: SvgIconProps) => {
  // The crescent is drawn as an OUTSIDE stroke: a pre-expanded outline path, masked by the
  // crescent itself so only the ring survives. The mask id must be unique — this icon renders in
  // both the settings menu and the mobile drawer at the same time.
  const maskId = useId();

  return (
    <SvgIcon
      sx={[{ fill: 'none' }, ...(Array.isArray(sx) ? sx : [sx])]}
      viewBox="0 0 18 18"
      {...rest}
    >
      <mask
        id={maskId}
        maskUnits="userSpaceOnUse"
        x="1.40002"
        y="1.39844"
        width="14"
        height="14"
        fill="black"
      >
        <rect fill="white" x="1.40002" y="1.39844" width="14" height="14" />
        <path d="M10.8629 3.39844C12.5678 4.33237 13.7241 6.14258 13.7242 8.22363C13.7242 11.2608 11.2624 13.7236 8.22522 13.7236C6.14431 13.7236 4.3341 12.5669 3.40002 10.8623C3.97815 11.0508 4.59492 11.1543 5.23596 11.1543C8.50499 11.1543 11.1547 8.50434 11.1549 5.23535C11.1549 4.59405 11.0515 3.97676 10.8629 3.39844Z" />
      </mask>
      <path
        d="M10.8629 3.39844L11.6316 1.99518C11.0561 1.67993 10.3465 1.74803 9.84141 2.16696C9.33636 2.5859 9.13831 3.27073 9.34178 3.89457L10.8629 3.39844ZM13.7242 8.22363H15.3242V8.22355L13.7242 8.22363ZM8.22522 13.7236V15.3236H8.22523L8.22522 13.7236ZM3.40002 10.8623L3.89597 9.34111C3.27211 9.13771 2.58729 9.33586 2.16842 9.84096C1.74955 10.3461 1.68154 11.0557 1.99687 11.6312L3.40002 10.8623ZM5.23596 11.1543V12.7543H5.23598L5.23596 11.1543ZM11.1549 5.23535L12.7549 5.23545V5.23535H11.1549ZM10.8629 3.39844L10.0942 4.80169C11.3076 5.46635 12.1242 6.7507 12.1242 8.22371L13.7242 8.22363L15.3242 8.22355C15.3241 5.53446 13.8281 3.19838 11.6316 1.99518L10.8629 3.39844ZM13.7242 8.22363H12.1242C12.1242 10.3775 10.3783 12.1236 8.22521 12.1236L8.22522 13.7236L8.22523 15.3236C12.1464 15.3236 15.3242 12.1441 15.3242 8.22363H13.7242ZM8.22522 13.7236V12.1236C6.75263 12.1236 5.4681 11.3069 4.80318 10.0934L3.40002 10.8623L1.99687 11.6312C3.2001 13.827 5.53599 15.3236 8.22522 15.3236V13.7236ZM3.40002 10.8623L2.90407 12.3835C3.6376 12.6226 4.42156 12.7543 5.23596 12.7543V11.1543V9.5543C4.76827 9.5543 4.31871 9.47893 3.89597 9.34111L3.40002 10.8623ZM5.23596 11.1543L5.23598 12.7543C9.38874 12.7543 12.7546 9.38793 12.7549 5.23545L11.1549 5.23535L9.55491 5.23525C9.55476 7.62075 7.62125 9.55427 5.23595 9.5543L5.23596 11.1543ZM11.1549 5.23535H12.7549C12.7549 4.42109 12.6235 3.63652 12.384 2.9023L10.8629 3.39844L9.34178 3.89457C9.47956 4.31701 9.55491 4.76702 9.55491 5.23535H11.1549Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </SvgIcon>
  );
};
