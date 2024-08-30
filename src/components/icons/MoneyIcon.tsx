import { SvgIcon, SvgIconProps } from '@mui/material';

export const MoneyIcon = ({ sx, ...rest }: SvgIconProps) => {
  return (
    <SvgIcon
      sx={{ fill: 'none', stroke: '#A5A8B6', ...sx }}
      viewBox="0 0 60 60"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Wallet"
      {...rest}
    >
      <path
        d="M57.125 30.375V27C57.125 25.5 55.875 24.25 54.375 24.25H51.875C53.375 24.25 54.625 23 54.625 21.5V18.125C54.625 16.625 53.375 15.375 51.875 15.375H33.625C32.125 15.625 30.875 16.875 30.875 18.375V21.75C30.875 23.25 32.125 24.5 33.625 24.5H36.125C34.625 24.375 33.375 25.625 33.375 27.125V30.5C33.375 32 34.625 33.25 36.125 33.25H33.625C32.125 33.125 30.875 34.375 30.875 35.875V39.25C30.875 40.75 32.125 42 33.625 42H36.125C34.625 41.875 33.375 43.125 33.375 44.625V48C33.375 49.5 34.625 50.75 36.125 50.75H33.625C32.125 50.625 30.875 51.875 30.875 53.375V56.75C30.875 58.25 32.125 59.5 33.625 59.5H52C53.5 59.5 54.75 58.25 54.75 56.75V53.375C54.75 51.875 53.5 50.625 52 50.625H54.5C56 50.625 57.25 49.375 57.25 47.875V44.5C57.25 43 56 41.75 54.5 41.75H52C53.5 41.75 54.75 40.5 54.75 39V35.625C54.75 34.125 53.5 32.875 52 32.875H54.5C55.875 33.125 57.125 31.875 57.125 30.375Z"
        fill="black"
        fillOpacity="0.15"
      />
      <path
        d="M34 43H44.375C45.875 43 47.125 44.25 47.125 45.75V49.125C47.125 50.625 45.875 51.875 44.375 51.875H28.375"
        stroke="white"
        strokeWidth="3"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M31.625 34.25H46.75C48.25 34.25 49.5 35.5 49.5 37V40.375C49.5 41.875 48.25 43.125 46.75 43.125H36.375"
        stroke="white"
        strokeWidth="3"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M31.625 25.5H44.25C45.75 25.5 47 26.75 47 28.25V31.625C47 33.125 45.75 34.375 44.25 34.375"
        stroke="white"
        strokeWidth="3"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44.25 25.5H26C24.5 25.5 23.25 24.25 23.25 22.75V19.375C23.25 17.875 24.5 16.625 26 16.625H44.375C45.875 16.625 47.125 17.875 47.125 19.375V22.75C47 24.25 45.75 25.5 44.25 25.5Z"
        stroke="white"
        strokeWidth="3"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M43.625 8H46.875C48.375 8 49.625 9.25 49.625 10.75V14.125C49.625 15.625 48.375 16.875 46.875 16.875H28.5C27 16.875 25.75 15.625 25.75 14.125V10.75C25.75 9.25 27 8 28.5 8H37.125"
        stroke="white"
        strokeWidth="3"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 50.625C19.5 51.375 17.875 51.75 16.25 51.75C10 51.75 5 46.75 5 40.5C5 38.875 5.375 37.5 5.875 36.125"
        stroke="white"
        strokeWidth="3"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.25 30.875C12 29.875 14 29.25 16.125 29.25C22.375 29.25 27.375 34.25 27.375 40.5C27.375 42.5 26.875 44.375 26 46"
        stroke="white"
        strokeWidth="3"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
};
