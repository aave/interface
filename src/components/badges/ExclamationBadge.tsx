import { ExclamationIcon } from '@heroicons/react/solid';
import { SvgIcon, SvgIconProps } from '@mui/material';

export enum BadgeSize {
  SM = 15,
  MD = 20,
}

type ExclamationBadgeProps = {
  size: BadgeSize;
  iconProps?: SvgIconProps;
};

export const ExclamationBadge: React.FC<ExclamationBadgeProps> = ({ size, iconProps = {} }) => {
  const { sx: iconSx, ...restIconProps } = iconProps;
  return (
    <SvgIcon
      color="warning"
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#383D51',
        ...iconSx,
      }}
      {...restIconProps}
    >
      <ExclamationIcon />
    </SvgIcon>
  );
};
