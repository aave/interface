import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import StyledToggleButton from 'src/components/StyledToggleButton';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
import { ReserveWithId, useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { AssetCapsProviderSDK } from 'src/hooks/useAssetCapsSDK';
import { MainLayout } from 'src/layouts/MainLayout';
import { ReserveActions } from 'src/modules/reserve-overview/ReserveActions';
import { ReserveConfigurationWrapper } from 'src/modules/reserve-overview/ReserveConfigurationWrapper';
import { ReserveTopDetailsWrapper } from 'src/modules/reserve-overview/ReserveTopDetailsWrapper';
import { useRootStore } from 'src/store/root';

import { ContentContainer } from '../src/components/ContentContainer';

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
const StakeModal = dynamic(() =>
  import('../src/components/transactions/Stake/StakeModal').then((module) => module.StakeModal)
);
const StakeCooldownModal = dynamic(() =>
  import('../src/components/transactions/StakeCooldown/StakeCooldownModal').then(
    (module) => module.StakeCooldownModal
  )
);
const UnStakeModal = dynamic(() =>
  import('../src/components/transactions/UnStake/UnStakeModal').then(
    (module) => module.UnStakeModal
  )
);

export default function ReserveOverview() {
  const router = useRouter();
  const { supplyReserves } = useAppDataContext();
  const underlyingAsset = router.query.underlyingAsset as string;

  const [mode, setMode] = useState<'overview' | 'actions' | ''>('overview');
  const trackEvent = useRootStore((store) => store.trackEvent);

  //With SDK
  const reserve = supplyReserves.find((reserve) => {
    return reserve.underlyingToken.address.toLowerCase() === underlyingAsset?.toLowerCase();
  }) as ReserveWithId;

  //With Reserves
  // const reserveLegacy = reserves.find((reserve) => {
  //   return reserve.underlyingAsset.toLowerCase() === underlyingAsset?.toLowerCase();
  // }) as ComputedReserveData;
  const [pageEventCalled, setPageEventCalled] = useState(false);

  useEffect(() => {
    if (!pageEventCalled && reserve && reserve.underlyingToken.symbol && underlyingAsset) {
      trackEvent('Page Viewed', {
        'Page Name': 'Reserve Overview',
        Reserve: reserve.underlyingToken.symbol,
        Asset: underlyingAsset,
      });
      setPageEventCalled(true);
    }
  }, [trackEvent, reserve, underlyingAsset, pageEventCalled]);

  const isOverview = mode === 'overview';

  return (
    <AssetCapsProviderSDK asset={reserve}>
      <ReserveTopDetailsWrapper underlyingAsset={underlyingAsset} />

      <ContentContainer>
        <Box
          sx={{
            display: { xs: 'flex', lg: 'none' },
            justifyContent: { xs: 'center', xsm: 'flex-start' },
            mb: { xs: 3, xsm: 4 },
          }}
        >
          <StyledToggleButtonGroup
            color="primary"
            value={mode}
            exclusive
            onChange={(_, value) => setMode(value)}
            sx={{ width: { xs: '100%', xsm: '359px' }, height: '44px' }}
          >
            <StyledToggleButton value="overview" disabled={mode === 'overview'}>
              <Typography variant="subheader1">
                <Trans>Overview</Trans>
              </Typography>
            </StyledToggleButton>
            <StyledToggleButton value="actions" disabled={mode === 'actions'}>
              <Typography variant="subheader1">
                <Trans>Your info</Trans>
              </Typography>
            </StyledToggleButton>
          </StyledToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex' }}>
          {/** Main status and configuration panel*/}
          <Box
            sx={{
              display: { xs: !isOverview ? 'none' : 'block', lg: 'block' },
              width: { xs: '100%', lg: 'calc(100% - 432px)' },
              mr: { xs: 0, lg: 4 },
            }}
          >
            <ReserveConfigurationWrapper reserve={reserve} />
          </Box>

          {/** Right panel with actions*/}
          <Box
            sx={{
              display: { xs: isOverview ? 'none' : 'block', lg: 'block' },
              width: { xs: '100%', lg: '416px' },
            }}
          >
            <ReserveActions reserve={reserve} />
          </Box>
        </Box>
      </ContentContainer>
    </AssetCapsProviderSDK>
  );
}

ReserveOverview.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      {page}
      <StakeModal />
      <StakeCooldownModal />
      <UnStakeModal />
      <SavingsGhoDepositModal />
      <SavingsGhoWithdrawModal />
    </MainLayout>
  );
};
