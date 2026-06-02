import { GetUserStakeUIDataHumanized } from '@aave/contract-helpers/dist/esm/V3-uiStakeDataProvider-contract/types';
import { Box, Divider, Grid } from '@mui/material';
import { BigNumber } from 'ethers';
import { formatEther, formatUnits } from 'ethers/lib/utils';
import React from 'react';
import { SavingsCardSkeleton } from 'src/components/SavingsCardSkeleton';
import { StakeTokenFormatted } from 'src/hooks/stake/useGeneralStakeUiData';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { StkGhoDepositRow } from './StkGhoDepositRow';
import { StkGhoSavingsRate } from './StkGhoSavingsRate';
import { StkGhoWithdrawRow } from './StkGhoWithdrawRow';

export interface StkGhoDepositPanelProps {
  onStakeAction?: () => void;
  onWithdraw?: () => void;
  stakeData?: StakeTokenFormatted;
  stakeUserData?: GetUserStakeUIDataHumanized['stakeUserData'][0];
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  stakeTitle?: string;
  stakedToken: string;
  maxSlash?: string;
  icon?: string;
  children?: React.ReactNode;
}

export const StkGhoDepositPanel: React.FC<StkGhoDepositPanelProps> = ({
  onStakeAction,
  onWithdraw,
  stakedToken,
  stakeData,
  stakeUserData,
}) => {
  const { currentAccount } = useWeb3Context();

  if (!stakeData) {
    return <SavingsCardSkeleton hasAccount={!!currentAccount} />;
  }

  const availableToStake = formatEther(
    BigNumber.from(stakeUserData?.underlyingTokenUserBalance || '0')
  );

  const stakedAmount = formatEther(stakeUserData?.stakeTokenRedeemableAmount || '0');

  const stakedUSD = formatUnits(
    BigNumber.from(stakeUserData?.stakeTokenRedeemableAmount || '0').mul(
      stakeData.stakeTokenPriceUSD || '0'
    ),
    18 + 8
  );

  const claimableAmount = formatEther(stakeUserData?.userIncentivesToClaim || '0');

  const claimableUSD = formatUnits(
    BigNumber.from(stakeUserData?.userIncentivesToClaim || '0').mul(
      stakeData.rewardTokenPriceUSD || '0'
    ),
    18 + 8
  );

  return (
    <>
      {currentAccount && (
        <>
          <Grid container spacing={{ xs: 1, md: 2 }} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <StkGhoDepositRow
                availableToStake={availableToStake}
                onDeposit={onStakeAction}
                stakedToken={stakedToken}
              />

              <StkGhoWithdrawRow
                stakedAmount={stakedAmount}
                stakedUSD={stakedUSD}
                userIncentivesToClaim={stakeUserData?.userIncentivesToClaim}
                claimableAmount={claimableAmount}
                claimableUSD={claimableUSD}
                onWithdraw={onWithdraw}
                stakedToken={stakedToken}
              />
            </Grid>
          </Grid>

          <Divider />
        </>
      )}

      <Box sx={{ mt: currentAccount && stakeUserData ? 8 : 0 }}>
        <StkGhoSavingsRate totalDepositedUSD={stakeData.totalSupplyUSDFormatted} />
      </Box>
    </>
  );
};
