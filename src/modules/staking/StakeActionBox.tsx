import { Box, Typography } from '@mui/material';
import React, { ReactNode } from 'react';

import { FormattedNumber } from '../../components/primitives/FormattedNumber';
import { Row } from '../../components/primitives/Row';

interface StakeActionBoxProps {
  title: ReactNode;
  value: string;
  valueUSD: string;
  children: ReactNode;
  bottomLineTitle: ReactNode;
  bottomLineComponent: ReactNode;
}

export const StakeActionBox = ({
  title,
  value,
  valueUSD,
  children,
  bottomLineTitle,
  bottomLineComponent,
}: StakeActionBoxProps) => {
  return (
    <Box
      sx={(theme) => ({
        flex: 1,
        p: 4,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        borderRadius: '6px',
        border: `1px solid ${theme.palette.divider}`,
        background:
          theme.palette.mode === 'light'
            ? theme.palette.background.paper
            : theme.palette.background.surface,
      })}
    >
      <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <Typography mb={1} color="text.secondary">
          {title}
        </Typography>

        <FormattedNumber
          value={value}
          visibleDecimals={2}
          variant="secondary21"
          color={+value === 0 ? 'text.disabled' : 'text.primary'}
        />
        <FormattedNumber
          value={valueUSD}
          symbol="USD"
          visibleDecimals={2}
          variant="secondary12"
          color={+valueUSD === 0 ? 'text.disabled' : 'text.secondary'}
          symbolsColor={+valueUSD === 0 ? 'text.disabled' : 'text.secondary'}
        />
      </Box>

      <Box sx={{ width: '100%', mb: 2 }}>{children}</Box>

      <Row
        caption={bottomLineTitle}
        captionVariant="caption"
        captionColor="text.secondary"
        width="100%"
      >
        {bottomLineComponent}
      </Row>
    </Box>
  );
};
