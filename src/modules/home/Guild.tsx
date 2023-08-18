import { Trans } from '@lingui/macro';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import React from 'react';

import guildPng from './guild.png';

export const Guild = () => {
  return (
    <Card>
      <CardMedia sx={{ height: 140, backgroundPosition: 'top' }} image={guildPng.src} />
      <CardContent>
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          <Trans>Get Special Access To Our Discord</Trans>
        </Typography>

        <Typography component="div" mt={2}>
          <Trans>
            Join our Guild.xyz page to get special access to various channels in our Discord. If you
            have provided liquidty you are eligible to get special roles in our discord.
          </Trans>
        </Typography>
      </CardContent>
      <CardActions>
        <Button variant="contained" target="_blank" href={'https://guild.xyz/mooncakefi'}>
          <Trans>Join our Guild</Trans>
        </Button>
        <Button variant="outlined" target="_blank" href={'https://discord.gg/fCcv8K6Uqy'}>
          <Trans>Join our Discord</Trans>
        </Button>
      </CardActions>
    </Card>
  );
};
