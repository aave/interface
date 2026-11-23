import { SVGProps } from 'react';

export const InfoCircleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="8" cy="8" r="6.4" stroke="currentColor" strokeWidth="1.25" />
    <circle cx="8" cy="5" r="1" fill="currentColor" />
    <rect x="7.4" y="7" width="1.2" height="4.8" rx="0.6" fill="currentColor" />
  </svg>
);
