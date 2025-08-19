import { Trans } from '@lingui/macro';
import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';
import { useStakeDataSummary, useUmbrellaSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { GENERAL } from 'src/utils/events';
import { useShallow } from 'zustand/shallow';

import { Link } from '../../components/primitives/Link';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
import { MarketSwitcher } from './UmbrellaMarketSwitcher';

export const UmbrellaHeader: React.FC = () => {
  const theme = useTheme();
  const { currentAccount } = useWeb3Context();
  const [currentMarketData, trackEvent] = useRootStore(
    useShallow((store) => [store.currentMarketData, store.trackEvent])
  );
  // const [trackEvent, currentMarket, setCurrentMarket] = useRootStore(
  //   useShallow((store) => [store.trackEvent, store.currentMarket, store.setCurrentMarket])
  // );

  const upToLG = useMediaQuery(theme.breakpoints.up('lg'));
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const valueTypographyVariant = downToSM ? 'main16' : 'main21';
  const symbolsTypographyVariant = downToSM ? 'secondary16' : 'secondary21';

  return (
    <TopInfoPanel
      titleComponent={
        <Box mb={4}>
          {/* <ChainAvailabilityText wrapperSx={{ mb: 4 }} chainId={ChainId.mainnet} /> */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            {/* <img src={`/aave-logo-purple.svg`} width="64px" height="64px" alt="" /> */}
            <Typography
              variant={downToXSM ? 'h2' : upToLG ? 'display1' : 'h1'}
              sx={{ ml: 2, mr: 3 }}
            >
              <Trans>Staking</Trans>
            </Typography>
            <MarketSwitcher />
          </Box>

          <Typography sx={{ color: '#8E92A3', maxWidth: '824px' }}>
            <Trans>
              Umbrella is the upgraded version of the Safety Module. Manage your previously staked
              assets
            </Trans>{' '}
            <Link href="/safety-module" sx={{ textDecoration: 'underline', color: '#8E92A3' }}>
              <Trans>here.</Trans>
            </Link>
            <br />
            <br />
            <Trans>
              Stake your Aave aTokens or underlying assets to earn rewards. In case of a shortfall
              event, your stake may be slashed to cover the deficit.
            </Trans>{' '}
            <Link
              href="https://aave.com/docs/primitives/umbrella"
              sx={{ textDecoration: 'underline', color: '#8E92A3' }}
              onClick={() =>
                trackEvent(GENERAL.EXTERNAL_LINK, {
                  Link: 'Staking Risks',
                })
              }
            >
              <Trans>Learn more about the risks.</Trans>
            </Link>
          </Typography>
        </Box>
      }
    >
      {currentAccount ? (
        <UmbrellaHeaderUserDetails
          currentMarketData={currentMarketData}
          valueTypographyVariant={valueTypographyVariant}
          symbolsTypographyVariant={symbolsTypographyVariant}
        />
      ) : (
        <UmbrellaHeaderDefault
          currentMarketData={currentMarketData}
          valueTypographyVariant={valueTypographyVariant}
          symbolsTypographyVariant={symbolsTypographyVariant}
        />
      )}
    </TopInfoPanel>
  );
};

const UmbrellaHeaderUserDetails = ({
  currentMarketData,
  valueTypographyVariant,
  symbolsTypographyVariant,
}: {
  currentMarketData: MarketDataType;
  valueTypographyVariant: 'main16' | 'main21';
  symbolsTypographyVariant: 'secondary16' | 'secondary21';
}) => {
  const theme = useTheme();
  const { data: stakedDataWithTokenBalances, loading: isLoadingStakedDataWithTokenBalances } =
    useUmbrellaSummary(currentMarketData);
  const { data: stakeData, loading } = useStakeDataSummary(currentMarketData);
  const { openUmbrellaClaimAll } = useModalContext();

  const totalUSDAggregateStaked = stakedDataWithTokenBalances?.aggregatedTotalStakedUSD;
  const weightedAverageApy = stakedDataWithTokenBalances?.weightedAverageApy;

  const userRewardsUsd = stakedDataWithTokenBalances?.stakeData.reduce((acc, stake) => {
    const totalAvailableToClaim = stake.formattedRewards.reduce(
      (sum, reward) => sum + Number(reward.accruedUsd || '0'),
      0
    );
    return acc + totalAvailableToClaim;
  }, 0);

  const userHasRewards =
    userRewardsUsd !== undefined && userRewardsUsd > 0 && !isLoadingStakedDataWithTokenBalances;

  return (
    <>
      <TopInfoPanelItem
        hideIcon
        title={
          <Stack direction="row" alignItems="center">
            <Trans>Total amount staked</Trans>
          </Stack>
        }
        loading={loading}
      >
        <FormattedNumber
          value={stakeData?.allStakeAssetsToatlSupplyUsd || '0'}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
          compact
          symbolsColor={theme.palette.text.muted}
          symbolsVariant={symbolsTypographyVariant}
        />
      </TopInfoPanelItem>
      <TopInfoPanelItem
        hideIcon
        title={
          <Stack direction="row" alignItems="center">
            <Trans>Staked Balance</Trans>
          </Stack>
        }
        loading={isLoadingStakedDataWithTokenBalances}
      >
        <FormattedNumber
          value={totalUSDAggregateStaked || '0'}
          symbol="USD"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor={theme.palette.text.muted}
          visibleDecimals={2}
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem
        hideIcon
        title={<Trans>Net APY</Trans>}
        loading={isLoadingStakedDataWithTokenBalances}
      >
        <FormattedNumber
          value={weightedAverageApy || 0}
          variant={valueTypographyVariant}
          symbolsColor={theme.palette.text.muted}
          visibleDecimals={2}
          percent
          symbolsVariant={symbolsTypographyVariant}
        />
      </TopInfoPanelItem>
      {userHasRewards && (
        <TopInfoPanelItem
          title={<Trans>Available rewards</Trans>}
          loading={isLoadingStakedDataWithTokenBalances}
          hideIcon
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', xsm: 'center' },
              flexDirection: { xs: 'column', xsm: 'row' },
            }}
          >
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <FormattedNumber
                value={userRewardsUsd}
                variant={valueTypographyVariant}
                visibleDecimals={2}
                compact
                symbol="USD"
                symbolsColor={theme.palette.text.muted}
                symbolsVariant={symbolsTypographyVariant}
              />
            </Box>

            <Button
              variant="gradient"
              size="small"
              onClick={() => openUmbrellaClaimAll()}
              sx={{ minWidth: 'unset', ml: { xs: 0, xsm: 2 } }}
            >
              <Trans>Claim</Trans>
            </Button>
          </Box>
        </TopInfoPanelItem>
      )}
    </>
  );
};

const UmbrellaHeaderDefault = ({
  currentMarketData,
  valueTypographyVariant,
  symbolsTypographyVariant,
}: {
  currentMarketData: MarketDataType;
  valueTypographyVariant: 'main16' | 'main21';
  symbolsTypographyVariant: 'secondary16' | 'secondary21';
}) => {
  const theme = useTheme();
  const { data: stakeData, loading } = useStakeDataSummary(currentMarketData);

  return (
    <>
      <TopInfoPanelItem
        hideIcon
        title={
          <Stack direction="row" alignItems="center">
            <Trans>Total amount staked</Trans>
          </Stack>
        }
        loading={loading}
      >
        <FormattedNumber
          value={stakeData?.allStakeAssetsToatlSupplyUsd || '0'}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
          compact
          symbolsColor={theme.palette.text.muted}
          symbolsVariant={symbolsTypographyVariant}
        />
      </TopInfoPanelItem>
    </>
  );
};
