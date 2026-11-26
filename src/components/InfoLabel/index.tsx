import { Typography } from '@mui/material';
import { ReactNode } from 'react';
import { InfoCircleIcon } from 'src/components/icons/InfoCircleIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';

export const InfoLabel = ({
  label,
  tooltip,
  iconMargin,
  id,
}: {
  label: ReactNode;
  tooltip?: ReactNode;
  iconMargin: number;
  id?: string;
}) =>
  tooltip ? (
    <TextWithTooltip
      id={id}
      text={label}
      variant="base"
      textColor="fg-3"
      noWrap
      icon={<InfoCircleIcon />}
      iconSize={16}
      iconColor="fg-4"
      iconMargin={iconMargin}
      wrapperProps={{ sx: { minWidth: 0 } }}
    >
      <>{tooltip}</>
    </TextWithTooltip>
  ) : (
    <Typography id={id} variant="base" color="fg-3" noWrap>
      {label}
    </Typography>
  );
