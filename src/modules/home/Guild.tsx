import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Typography } from '@mui/material';
import React from 'react';

export const Guild = () => {
  return (
    <Paper
      sx={(theme) => ({
        border: `1px solid ${theme.palette.divider}`,
        padding: 6,
      })}
    >
      <Typography component="div">
        <Trans>
          Join our Guild.xyz page to get special access to various channels in our Discord. If you
          have provided liquidty you are eligible to get special roles in our discord.
        </Trans>
      </Typography>
      <Box mt={8} flexDirection={'row'} display={'flex'} justifyContent={'flex-start'}>
        <Button variant="contained" href={'https://guild.xyz/mooncakefi'}>
          <Trans>Join our Guild</Trans>
        </Button>
      </Box>
    </Paper>
  );
};
