import { XIcon, DuplicateIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, Link, SvgIcon, Typography } from '@mui/material';

export const TxErrorView = ({ errorMessage }: { errorMessage: string }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Box
        sx={{
          width: '48px',
          height: '48px',
          color: 'red',
          backgroundColor: '#F9EBEB',
          borderRadius: '50%',
        }}
      >
        <SvgIcon sx={{ width: '16px', height: '16px', color: 'red' }} fontSize="small">
          <XIcon />
        </SvgIcon>
      </Box>
      <Typography sx={{ mt: '16px' }} variant="h2">
        <Trans>Transaction failed</Trans>
      </Typography>
      <Typography sx={{ mt: '8px' }} variant="description">
        <Trans>
          You can report incident to our{' '}
          <Link href="https://discord.gg/7kHKnkDEUf" target="_blank">
            Discord
          </Link>{' '}
          or{' '}
          <Link href="https://github.com/aave/aave-ui" target="_blank">
            Github
          </Link>
          .
        </Trans>
      </Typography>
      <Button
        variant="outlined"
        onClick={() => navigator.clipboard.writeText(errorMessage)}
        sx={{ width: '124px', height: '20px', mt: '24px' }}
      >
        <Typography variant="buttonS">
          <Trans>COPY ERROR</Trans>
        </Typography>
        <SvgIcon sx={{ ml: '4px', width: '8px', height: '8px' }} fontSize="small">
          <DuplicateIcon />
        </SvgIcon>
      </Button>
    </Box>
  );
};
