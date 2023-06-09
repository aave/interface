import { Trans } from '@lingui/macro';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { Box, Paper, Typography } from '@mui/material';
import Image from 'next/image';
import * as React from 'react';

const TGEPhaseInfo = () => {
  return (
    <>
      <Paper
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '0px 10px 30px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          p: { xs: '36px', xsm: '46px' },
        }}
      >
        <Box>
          <Image
            src="/icons/maneki/whitelist-icon.png"
            alt="whitelist icon"
            width={`${62 * 0.7}px`}
            height={`${75 * 0.7}px`}
          />
          <Typography
            variant="h2"
            sx={{ mt: '24px', fontWeight: '700', fontSize: '20px', lineHeight: '24px' }}
          >
            <Trans>Whitelist Phase</Trans>
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: '16px',
            lineHeight: '21px',
          }}
        >
          <Trans>
            For the first 24 hours, 6 million PAW tokens (6% of the supply) are available for
            whitelist participates at the fixed price of 0.0002 ETH(~$0.36) and the FDV of ~$36m
            with a market cap of ~$6.8m. Whitelist addresses are selected from historic vault users,
            traders and contributors. The allocation of each whitelist address depends on the
            historic activities. First 30 mins of the whitelist phase has a max deposit limit of 1
            ETH for each address. Participation is on a first come first served basis and will end
            early if all the allocation is filled. Please note that being whitelisted does not
            guarantee a spot if all the allocation is filled early.
          </Trans>
        </Typography>
      </Paper>
      <Paper
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '0px 10px 30px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          p: { xs: '36px', xsm: '46px' },
          mt: { xs: '36px', xsm: '62px' },
        }}
      >
        <Box>
          <ErrorOutlineOutlinedIcon
            sx={{ width: `${62 * 0.7}px`, height: `${75 * 0.7}px`, color: 'error.dark' }}
          />
          <Typography
            variant="h2"
            sx={{ mt: '16px', fontWeight: '700', fontSize: '20px', lineHeight: '24px' }}
          >
            <Trans>Important Risks</Trans>
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: '16px',
            lineHeight: '21px',
          }}
        >
          <Trans>
            U.S. residents or citizens are not permitted to participant in the Token Generation
            Event (TGE). By taking part in the event you certify you are neither a U.S. citizen or
            resident.
          </Trans>
        </Typography>
      </Paper>
    </>
  );
};

export default TGEPhaseInfo;
