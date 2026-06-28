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
  cooldownAmount?: ReactNode;
  gradientBorder?: boolean;
  dataCy: string;
}

export const StakeActionBox = ({
  title,
  value,
  valueUSD,
  children,
  bottomLineTitle,
  bottomLineComponent,
  gradientBorder,
  dataCy,
  cooldownAmount,
}: StakeActionBoxProps) => {
  return (
    <Box
      sx={(theme) => ({
        flex: 1,
        display: 'flex',
        borderRadius: '6px',
        border: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        '&:after': {
          content: "''",
          borderRadius: '6px',
          position: 'absolute',
          top: -1,
          bottom: -1,
          left: -1,
          right: -1,
          background: gradientBorder ? theme.palette.gradients.aaveGradient : 'transparent',
        },
      })}
    >
      <Box
        sx={(theme) => ({
          flex: 1,
          p: 4,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          borderRadius: '6px',
          background: theme.palette.background.paper,
          position: 'relative',
          zIndex: 2,
        })}
        data-cy={dataCy}
      >
        <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
          <Typography mb={1} color="text.secondary">
            {title}
          </Typography>

          <FormattedNumber
            value={value}
            visibleDecimals={2}
            variant="secondary21"
            color={+value === 0 ? 'text.muted' : 'text.primary'}
            data-cy={`amountNative`}
          />
          <FormattedNumber
            value={valueUSD}
            symbol="USD"
            visibleDecimals={2}
            variant="secondary12"
            color={+valueUSD === 0 ? 'text.muted' : 'text.secondary'}
            symbolsColor={+valueUSD === 0 ? 'text.muted' : 'text.secondary'}
            data-cy={`amountUSD`}
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
        {cooldownAmount}
      </Box>
    </Box>
  );
};
