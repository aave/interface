import { Trans } from '@lingui/macro';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';
import { useStakeDataSummary, useUmbrellaSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';
import { useShallow } from 'zustand/shallow';

import { Link } from '../../components/primitives/Link';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
import { MarketSwitcher } from './UmbrellaMarketSwitcher';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { MarketDataType } from 'src/ui-config/marketsConfig';

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
              <Trans>Staking 00</Trans>
            </Typography>
            <MarketSwitcher />
          </Box>

          <Typography sx={{ color: '#8E92A3', maxWidth: '824px' }}>
            <Trans>
              Users can stake their assets in the protocol and earn incentives. In the case of a
              shortfall event, your stake can be slashed to cover the deficit, providing an
              additional layer of protection for the protocol.
            </Trans>{' '}
            <Link
              href="https://docs.aave.com/faq/migration-and-staking"
              sx={{ textDecoration: 'underline', color: '#8E92A3' }}
              onClick={() =>
                trackEvent(GENERAL.EXTERNAL_LINK, {
                  Link: 'Staking Risks',
                })
              }
            >
              <Trans>Learn more about risks involved</Trans>
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
  const { data: stakedDataWithTokenBalances, loading: isLoadingStakedDataWithTokenBalances } =
    useUmbrellaSummary(currentMarketData);

  const totalUSDAggregateStaked = stakedDataWithTokenBalances?.[0].aggregatedTotalStakedUSD;
  const weightedAverageApy = stakedDataWithTokenBalances?.[0].weightedAverageApy;

  return (
    <>
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
          symbolsColor="#A5A8B6"
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
          symbolsColor="#A5A8B6"
          visibleDecimals={2}
          percent
          symbolsVariant={symbolsTypographyVariant}
        />
      </TopInfoPanelItem>
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
          symbolsColor="#A5A8B6"
          symbolsVariant={symbolsTypographyVariant}
        />
      </TopInfoPanelItem>
    </>
  );
};
