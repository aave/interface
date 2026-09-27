import { SvgIcon, SvgIconProps } from '@mui/material';

const FRAME = '0 0 37.7143 37.7143';

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '2.57143',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export const TxSuccessIcon = (props: SvgIconProps) => (
  <SvgIcon viewBox={FRAME} {...props}>
    <path d="M27.6509 13.0356L14.8075 26.3928L9.67011 20.7417" {...stroke} />
  </SvgIcon>
);

export const TxErrorIcon = (props: SvgIconProps) => (
  <SvgIcon viewBox={FRAME} {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M26.0902 10.6615C26.5922 10.1596 27.4065 10.1598 27.9086 10.6615C28.4107 11.1636 28.4106 11.9778 27.9086 12.4799L21.1029 19.2846L27.9086 26.0902C28.4107 26.5923 28.4107 27.4065 27.9086 27.9086C27.4065 28.4107 26.5923 28.4107 26.0902 27.9086L19.2846 21.1029L12.4799 27.9086C11.9778 28.4106 11.1636 28.4107 10.6615 27.9086C10.1598 27.4065 10.1597 26.5922 10.6615 26.0902L17.4662 19.2846L10.6615 12.4799C10.1598 11.9777 10.1596 11.1635 10.6615 10.6615C11.1635 10.1596 11.9777 10.1598 12.4799 10.6615L19.2846 17.4662L26.0902 10.6615Z"
      fill="currentColor"
    />
  </SvgIcon>
);

export const TxPendingIcon = (props: SvgIconProps) => (
  <SvgIcon viewBox={FRAME} {...props}>
    <path d="M19.4578 32.3572L19.4577 19.4556L12.8371 12.8349" {...stroke} />
  </SvgIcon>
);

export const TxExpiredIcon = (props: SvgIconProps) => (
  <SvgIcon viewBox={FRAME} {...props}>
    <path d="M29.3572 19.4548L19.4585 19.4508L19.4585 11.3523" {...stroke} />
  </SvgIcon>
);
