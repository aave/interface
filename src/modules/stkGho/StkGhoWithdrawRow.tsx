import { Stake } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { SAFETY_MODULE } from 'src/utils/events';

import { StakeActionBox } from '../staking/StakeActionBox';

interface StkGhoWithdrawRowProps {
  stakedAmount: string;
  stakedUSD: string;
  userIncentivesToClaim?: string;
  claimableAmount: string;
  claimableUSD: string;
  onWithdraw?: () => void;
  stakedToken: string;
}

export const StkGhoWithdrawRow = ({
  stakedAmount,
  stakedUSD,
  userIncentivesToClaim,
  claimableAmount,
  claimableUSD,
  onWithdraw,
  stakedToken,
}: StkGhoWithdrawRowProps) => {
  const { openStakeRewardsClaim } = useModalContext();
  const trackEvent = useRootStore((store) => store.trackEvent);

  const handleClaim = () => {
    trackEvent(SAFETY_MODULE.STAKE_SAFETY_MODULE, {
      action: SAFETY_MODULE.OPEN_CLAIM_MODAL,
      asset: 'GHO',
      stakeType: 'Safety Module',
      rewardType: 'Claim',
    });
    openStakeRewardsClaim(Stake.gho, 'AAVE');
  };

  const hasBalance = Number(stakedAmount) > 0;
  const hasIncentives = !!userIncentivesToClaim && parseFloat(userIncentivesToClaim) > 0;

  return (
    <Box>
      <StakeActionBox
        title={<Trans>stkGHO</Trans>}
        value={stakedAmount}
        valueUSD={stakedUSD}
        dataCy={`stakedBox_${stakedToken}`}
        bottomLineTitle={
          <Typography variant="caption" color="text.secondary">
            <Trans>Cooldown period</Trans>
          </Typography>
        }
        bottomLineComponent={
          <Typography variant="secondary12">
            <Trans>Instant</Trans>
          </Typography>
        }
      >
        <Button
          variant="outlined"
          fullWidth
          onClick={onWithdraw}
          disabled={!hasBalance}
          data-cy={`withdrawBtn_${stakedToken}`}
        >
          <Trans>Withdraw</Trans>
        </Button>
      </StakeActionBox>

      {hasIncentives && (
        <Box sx={{ mt: 4 }}>
          <StakeActionBox
            title={<Trans>Claimable AAVE</Trans>}
            value={claimableAmount}
            valueUSD={claimableUSD}
            bottomLineTitle={<></>}
            dataCy={`rewardBox_${stakedToken}`}
            bottomLineComponent={<Box sx={{ height: '19px' }} />}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { sm: 'row', xs: 'column' },
                justifyContent: 'space-between',
              }}
            >
              <Button
                variant="contained"
                onClick={handleClaim}
                data-cy={`claimBtn_${stakedToken}`}
                sx={{
                  flex: 1,
                  mb: { xs: 2, sm: 0 },
                  mr: { xs: 0, sm: 1 },
                }}
              >
                <Trans>Claim</Trans>
              </Button>
            </Box>
          </StakeActionBox>
        </Box>
      )}
    </Box>
  );
};
