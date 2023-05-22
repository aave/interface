import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { useModalContext } from 'src/hooks/useModal';
import { useAirdropContext } from 'src/maneki/hooks/airdrop-data-provider/AirdropDataProvider';

interface entryType {
  address: string;
  amount: number;
  claimIdx: number;
  index: number;
}

interface AirdropContentWrapperProps {
  title: string;
  mainHeader: string;
  airdropStatus: string;
  description?: ReactNode;
  entry: entryType | null;
  isClaimed: boolean;
  setAirdropNumber: number;
}

export default function AirdropContentWrapper({
  title,
  mainHeader,
  airdropStatus = 'Unavailable',
  description,
  entry,
  isClaimed,
  setAirdropNumber,
}: AirdropContentWrapperProps) {
  const { openAirDrop } = useModalContext();
  const { setCurrentSelectedAirdrop } = useAirdropContext();
  return (
    <Paper
      sx={(theme) => ({
        width: '50%',
        px: { xs: 4, xsm: 6 },
        py: { xs: 3.5, xsm: 4 },
        borderRadius: '10px',
        m: 'auto',
        boxShadow: `0px 4px 250px ${theme.palette.shadow.markets}`,
      })}
    >
      <Box>
        <Typography variant="h2" color="text.secondary" sx={{ ml: '16px' }}>
          {mainHeader} (<Trans>{airdropStatus}</Trans>)
        </Typography>
        {description}
      </Box>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
        }}
      >
        {!entry ? (
          <Typography variant="h4">
            <Trans>You are not eligle to claim from {title}</Trans>
          </Typography>
        ) : isClaimed ? (
          <Typography variant="h4">
            <Trans>You already claimed {title}</Trans>
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: '24px',
            }}
          >
            <Box
              sx={{
                width: '80%',
                p: '12px 24px',
                backgroundColor: 'background.custom1',
                mr: '12px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <FormattedNumber value={entry.amount / 1000000000000000000} variant="secondary14" />
              <Typography sx={{ fontWeight: '600' }}>PAW</Typography>
            </Box>
            <Button
              //   disabled={!isActive}
              onClick={() => {
                setCurrentSelectedAirdrop(setAirdropNumber);
                openAirDrop();
              }}
              variant="contained"
              sx={{ width: '20%', display: 'block', p: '12px', borderRadius: '4px' }}
            >
              <Trans>Claim</Trans>
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
