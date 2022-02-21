import { Trans } from '@lingui/macro';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackOutlined';
import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { getMarketInfoById, MarketLogo } from 'src/components/MarketSwitcher';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
import {
  ComputedReserveData,
  useAppDataContext,
} from '../../hooks/app-data-provider/useAppDataProvider';

interface ReserveTopDetailsProps {
  underlyingAsset: string;
}

export const ReserveTopDetails = ({ underlyingAsset }: ReserveTopDetailsProps) => {
  const router = useRouter();
  const { reserves } = useAppDataContext();
  const { currentMarket, currentNetworkConfig } = useProtocolDataContext();
  const { market, network } = getMarketInfoById(currentMarket);

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  if (!poolReserve) {
    return <>Empty data</>;
  }

  return (
    <TopInfoPanel>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            variant="surface"
            size="medium"
            color="primary"
            startIcon={<ArrowBackRoundedIcon sx={{ width: '16px', height: '14px' }} />}
            onClick={() => router.back()}
            sx={{ mr: '11.11px' }}
          >
            <Trans>Go Back</Trans>
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MarketLogo size={20} logo={network.networkLogoPath} />
            <Typography variant="subheader1" sx={{ color: 'common.white' }}>
              {market.marketTitle} <Trans>Market</Trans>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
          <TopInfoPanelItem
            title={<Trans>Asset</Trans>}
            icon={
              <image
                href={`/icons/tokens/${poolReserve.iconSymbol.toLowerCase()}.svg`}
                width="100%"
                height="100%"
                preserveAspectRatio="none"
              />
            }
          >
            <Typography variant="main21">{poolReserve.name}</Typography>
          </TopInfoPanelItem>

          <TopInfoPanelItem title={<Trans>Reserve Size</Trans>}>
            <FormattedNumber value={poolReserve.totalLiquidityUSD} symbol="USD" variant="main21" />
          </TopInfoPanelItem>

          <TopInfoPanelItem title={<Trans>Available liquidity</Trans>}>
            <FormattedNumber
              value={poolReserve.availableLiquidityUSD}
              symbol="USD"
              variant="main21"
            />
          </TopInfoPanelItem>

          <TopInfoPanelItem title={<Trans>Utilization Rate</Trans>}>
            <FormattedNumber value={poolReserve.utilizationRate} percent variant="main21" />
          </TopInfoPanelItem>

          <TopInfoPanelItem title={<Trans>Oracle price</Trans>}>
            <FormattedNumber value={poolReserve.priceInUSD} symbol="USD" variant="main21" />
            <Link
              href={currentNetworkConfig.explorerLinkBuilder({ address: poolReserve.priceOracle })}
              target={'_blank'}
            >
              {poolReserve.priceOracle}
            </Link>
          </TopInfoPanelItem>
        </Box>
      </Box>
    </TopInfoPanel>
  );
};
