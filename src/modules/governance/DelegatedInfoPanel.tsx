import { Trans } from '@lingui/macro';
import { Button, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useVotingPower } from 'src/hooks/governance-data-provider/useVotingPower';
import { useModalContext } from 'src/hooks/useModal';

export const DelegatedInfoPanel = () => {
  const powers = useVotingPower();
  const { openGovDelegation } = useModalContext();

  return (
    <Box>
      <Box sx={{ px: 6, pt: 4, pb: 6, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography>Delegate your power</Typography>
        </Box>
        <Button
          variant="contained"
          disabled={
            powers?.votingPower === '0' &&
            powers?.propositionPower === '0' &&
            powers?.aaveVotingDelegatee === '' &&
            powers?.aavePropositionDelegatee === '' &&
            powers?.stkAavePropositionDelegatee === '' &&
            powers?.stkAaveVotingDelegatee === ''
          }
          onClick={() => openGovDelegation()}
        >
          <Trans>Set up delegation</Trans>
        </Button>
      </Box>
    </Box>
  );
};
