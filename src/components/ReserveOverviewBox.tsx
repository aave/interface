import React, { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { Trans } from '@lingui/macro';

type ReserveOverviewBoxProps = {
  children: ReactNode;
  title: string;
};

export function ReserveOverviewBox({ title, children }: ReserveOverviewBoxProps) {
  return (
    <Box
      sx={(theme) => ({
        borderRadius: '6px',
        border: `1px solid ${theme.palette.divider}`,
        flex: '0 32%',
        marginBottom: '2%',
        height: { xs: '5em', xxs: '7em' },
        maxWidth: '32%',
      })}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          ml: 2,
          height: '100%',
          justifyContent: 'space-around',
          padding: '4px',
        }}
      >
        <Typography variant="secondary14" color="text.secondary" component="span">
          <Trans>{title}</Trans>
        </Typography>
        {children}
      </Box>
    </Box>
  );
}
