import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { PageHeaderStat } from 'src/components/PageHeader/PageHeaderStat';

import { FormattedNumber } from '../../../components/primitives/FormattedNumber';

interface ListTopInfoItemProps {
  title: ReactNode;
  value: number | string;
  percent?: boolean;
  tooltip?: ReactNode;
}

export const ListTopInfoItem = ({ title, value, percent, tooltip }: ListTopInfoItemProps) => {
  return (
    <PageHeaderStat
      label={
        tooltip ? (
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            {title}
            {tooltip}
          </Box>
        ) : (
          title
        )
      }
    >
      <FormattedNumber value={value} percent={percent} variant="statValue" symbol="USD" />
    </PageHeaderStat>
  );
};
