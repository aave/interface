import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { Trans } from '@lingui/macro';
import { Box, Paper, Typography } from '@mui/material';
import { formatEther } from 'ethers/lib/utils';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { MainLayout } from 'src/layouts/MainLayout';
import { SGhoWrapper } from 'src/modules/reserve-overview/SGho/SGhoWrapper';
import { SGHOHeader } from 'src/modules/sGho/SGhoHeader';
import { useRootStore } from 'src/store/root';

import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';

const SavingsGhoDepositModal = dynamic(() =>
  import('../src/components/transactions/SavingsGho/SavingsGhoDepositModal').then(
    (module) => module.SavingsGhoDepositModal
  )
);
const SavingsGhoWithdrawModal = dynamic(() =>
  import('../src/components/transactions/SavingsGho/SavingsGhoWithdrawModal').then(
    (module) => module.SavingsGhoWithdrawModal
  )
);

export default function SavingsGho() {
  const { currentAccount } = useWeb3Context();
  const trackEvent = useRootStore((store) => store.trackEvent);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'sGHO',
    });
  }, [trackEvent]);

  return (
    <>
      <SGHOHeader />
      <ContentContainer>
        <Box sx={{ display: 'flex' }}>
          {/** Main sGHO configuration panel*/}
          <Box
            sx={{
              width: { xs: '100%', lg: 'calc(100% - 432px)' },
              mr: { xs: 0, lg: 4 },
            }}
          >
            <SGhoWrapper />
          </Box>

          {/** Right panel with user info*/}
          <Box
            sx={{
              display: { xs: 'none', lg: 'block' },
              width: { xs: '100%', lg: '416px' },
            }}
          >
            {currentAccount ? <YourInfoGhoSection /> : <ConnectWallet />}
          </Box>
        </Box>
      </ContentContainer>
    </>
  );
}

const YourInfoGhoSection = () => {
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { walletBalances } = useWalletBalances(currentMarketData);
  const { data: stakeUserResult } = useUserStakeUiData(currentMarketData);

  const GHO_ADDRESS = AaveV3Ethereum.ASSETS.GHO.UNDERLYING;

  const userGhoBalance = GHO_ADDRESS
    ? walletBalances[GHO_ADDRESS.toLowerCase()] || { amount: '0', amountUSD: '0' }
    : { amount: '0', amountUSD: '0' };

  // Get sGHO balance from staking data (third element in the array)
  let stkGhoUserData;
  if (stakeUserResult && Array.isArray(stakeUserResult)) {
    [, , stkGhoUserData] = stakeUserResult;
  }

  const userSGhoBalance = stkGhoUserData?.stakeTokenRedeemableAmount
    ? formatEther(stkGhoUserData.stakeTokenRedeemableAmount)
    : '0';

  return (
    <Paper
      sx={{
        pt: 4,
        pb: { xs: 4, xsm: 6 },
        px: { xs: 4, xsm: 6 },
        minWidth: { md: '300px' },
        ml: { md: 4 },
        height: { md: '180px' },
        display: { xs: 'none', md: 'block' },
      }}
    >
      <Typography variant="h3" sx={{ mb: 6 }}>
        Your Info
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Available to Deposit
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <FormattedNumber value={userGhoBalance.amount} variant="h4" visibleDecimals={2} />
          <Typography variant="caption" color="text.secondary">
            GHO
          </Typography>
        </Box>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Currently Earning
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <FormattedNumber value={userSGhoBalance} variant="h4" visibleDecimals={2} />
          <Typography variant="caption" color="text.secondary">
            sGHO
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

const ConnectWallet = () => {
  return (
    <Paper
      sx={{
        pt: 4,
        pb: { xs: 4, xsm: 6 },
        px: { xs: 4, xsm: 6 },
        minWidth: { xs: '100%', md: '300px' },
        ml: { xs: 0, md: 4 },
        height: { xs: 'auto', md: '180px' },
        width: { xs: '100%', md: 'auto' },
      }}
    >
      <>
        <Typography variant="h3" sx={{ mb: { xs: 6, xsm: 10 } }}>
          <Trans>Your info</Trans>
        </Typography>
        <Typography sx={{ mb: 6 }} color="text.secondary">
          <Trans>Please connect a wallet to view your balance here.</Trans>
        </Typography>
        {}
        <ConnectWalletButton />
      </>
    </Paper>
  );
};

SavingsGho.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      {page}
      {/** Modals */}
      <SavingsGhoDepositModal />
      <SavingsGhoWithdrawModal />
      {/** End of modals */}
    </MainLayout>
  );
};
