import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { StakeModal } from 'src/components/transactions/Stake/StakeModal';
import { StakeCooldownModal } from 'src/components/transactions/StakeCooldown/StakeCooldownModal';
import { StakeRewardClaimModal } from 'src/components/transactions/StakeRewardClaim/StakeRewardClaimModal';
import { UnStakeModal } from 'src/components/transactions/UnStake/UnStakeModal';
import { MainLayout } from 'src/layouts/MainLayout';

import { StakeContainer } from '../src/maneki/modules/stake/StakeContainer';
import { StakeTopPanel } from '../src/maneki/modules/stake/StakeTopPanel';

export default function Staking() {
  const { breakpoints } = useTheme();
  const lg = useMediaQuery(breakpoints.up('lg'));

  const [mode, setMode] = useState<'aave' | 'bpt' | ''>('');

  useEffect(() => {
    if (!mode) setMode('aave');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lg]);

  return (
    <>
      <StakeTopPanel />
      <ContentContainer>
        <StakeContainer />
      </ContentContainer>
    </>
  );
}

Staking.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      {page}
      {/** Modals */}
      <StakeModal />
      <StakeCooldownModal />
      <UnStakeModal />
      <StakeRewardClaimModal />
      {/** End of modals */}
    </MainLayout>
  );
};
