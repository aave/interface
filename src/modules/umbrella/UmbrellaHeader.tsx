import { Trans } from '@lingui/macro';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';
import { useUmbrellaSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';
import { useShallow } from 'zustand/shallow';

import { Link } from '../../components/primitives/Link';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
// import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { MarketSwitcher } from './UmbrellaMarketSwitcher';

interface StakingHeaderProps {
  stkEmission: string;
  loading: boolean;
}

// TODO: Add APY
// Fix search on assets
// Add total value staked

// - Total balance USD Staked
// - Net APY across my assets. Average yield across all
//     - amount staked staked
//     - yield
//     - create weighted average
//     - Should show reserve APY + weighted average
// - if it is a wToken add in APY
export const UmbrellaHeader: React.FC<StakingHeaderProps> = ({ stkEmission, loading }) => {
  const theme = useTheme();
  // const { currentAccount } = useWeb3Context();
  const [currentMarketData, trackEvent] = useRootStore(
    useShallow((store) => [store.currentMarketData, store.trackEvent])
  );
  // const [trackEvent, currentMarket, setCurrentMarket] = useRootStore(
  //   useShallow((store) => [store.trackEvent, store.currentMarket, store.setCurrentMarket])
  // );

  const { data: stakedDataWithTokenBalances } = useUmbrellaSummary(currentMarketData);

  const upToLG = useMediaQuery(theme.breakpoints.up('lg'));
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const valueTypographyVariant = downToSM ? 'main16' : 'main21';
  const symbolsTypographyVariant = downToSM ? 'secondary16' : 'secondary21';

  const totalUSDAggregateStaked = stakedDataWithTokenBalances?.[0];

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
      <TopInfoPanelItem
        hideIcon
        title={
          <Stack direction="row" alignItems="center">
            <Trans>Staked Balance</Trans>
          </Stack>
        }
        loading={loading}
      >
        <FormattedNumber
          value={totalUSDAggregateStaked?.aggregatedTotalStakedUSD || '0'}
          symbol="USD"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#A5A8B6"
          visibleDecimals={2}
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem hideIcon title={<Trans>Total emission per day</Trans>} loading={loading}>
        <FormattedNumber
          value={stkEmission || 0}
          symbol="AAVE"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#A5A8B6"
          visibleDecimals={2}
        />
      </TopInfoPanelItem>
    </TopInfoPanel>
  );
};
