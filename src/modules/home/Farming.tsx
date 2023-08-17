import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Typography } from '@mui/material';
import React from 'react';

export const Farming = () => {
  return (
    <Paper
      sx={(theme) => ({
        border: `1px solid ${theme.palette.divider}`,
        padding: 6,
      })}
    >
      <Typography component="div">
        <Trans>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
          been the industry standard dummy text ever since the 1500s
        </Trans>
      </Typography>
      <Box mt={8} flexDirection={'row'} display={'flex'} justifyContent={'flex-start'}>
        <Button variant="outlined" href={'https://guild.xyz/mahadao'}>
          <Trans>View Details</Trans>
        </Button>
      </Box>
    </Paper>
  );
};
