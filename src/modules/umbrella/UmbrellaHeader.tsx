import { Trans } from '@lingui/macro';
import { useMediaQuery, useTheme } from '@mui/material';
import { PageHeader } from 'src/components/PageHeader/PageHeader';
import { PageHeaderStat } from 'src/components/PageHeader/PageHeaderStat';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { useStakeDataSummary, useUmbrellaSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';

type StatProps = {
  currentMarketData: MarketDataType;
  valueVariant: 'h4' | 'h2';
};

export const UmbrellaHeader: React.FC = () => {
  const theme = useTheme();
  const { currentAccount } = useWeb3Context();
  // The market is pinned to Core on the staking page (see pages/staking.page.tsx), so this reads Core.
  const currentMarketData = useRootStore((store) => store.currentMarketData);

  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));
  const valueVariant = downToSM ? 'h4' : 'h2';

  return (
    <PageHeader
      title="Staking"
      description={<Trans>Stake your Aave aTokens or underlying assets to earn rewards.</Trans>}
    >
      <TotalStakedStat currentMarketData={currentMarketData} valueVariant={valueVariant} />
      {currentAccount ? (
        <UmbrellaUserStats currentMarketData={currentMarketData} valueVariant={valueVariant} />
      ) : null}
    </PageHeader>
  );
};

// Total staked across the instance — shown whether or not a wallet is connected.
const TotalStakedStat = ({ currentMarketData, valueVariant }: StatProps) => {
  const { data: stakeData, loading } = useStakeDataSummary(currentMarketData);

  return (
    <PageHeaderStat label={<Trans>Total Staked</Trans>} loading={loading}>
      <FormattedNumber
        value={stakeData?.allStakeAssetsToatlSupplyUsd || '0'}
        symbol="USD"
        variant={valueVariant}
        visibleDecimals={2}
        compact
      />
    </PageHeaderStat>
  );
};

// Connected-only stats. Kept separate so `useUmbrellaSummary` (user-specific) is gated to the
// connected branch rather than run for logged-out visitors.
const UmbrellaUserStats = ({ currentMarketData, valueVariant }: StatProps) => {
  const { data: stakedDataWithTokenBalances, loading: isLoadingStakedDataWithTokenBalances } =
    useUmbrellaSummary(currentMarketData);

  const totalUSDAggregateStaked = stakedDataWithTokenBalances?.aggregatedTotalStakedUSD;
  const weightedAverageApy = stakedDataWithTokenBalances?.weightedAverageApy;

  return (
    <>
      <PageHeaderStat
        label={<Trans>Staked Balance</Trans>}
        loading={isLoadingStakedDataWithTokenBalances}
      >
        <FormattedNumber
          value={totalUSDAggregateStaked || '0'}
          symbol="USD"
          variant={valueVariant}
          visibleDecimals={2}
        />
      </PageHeaderStat>

      <PageHeaderStat label={<Trans>Net APY</Trans>} loading={isLoadingStakedDataWithTokenBalances}>
        <FormattedNumber
          value={weightedAverageApy || 0}
          variant={valueVariant}
          visibleDecimals={2}
          percent
        />
      </PageHeaderStat>
    </>
  );
};
