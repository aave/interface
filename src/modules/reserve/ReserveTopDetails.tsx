import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import {
  ComputedReserveData,
  useAppDataContext,
} from '../../hooks/app-data-provider/useAppDataProvider';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
import { useRouter } from 'next/router';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { getMarketInfoById, MarketLogo } from 'src/components/MarketSwitcher';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackOutlined';

export const ReserveTopDetails = () => {
  const router = useRouter();
  const underlyingAddress = router.query.underlyingAddress;
  const { reserves } = useAppDataContext();
  const { currentMarket } = useProtocolDataContext();
  const { market, network, withAAVELogo } = getMarketInfoById(currentMarket);

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAddress
  ) as ComputedReserveData;

  if (!poolReserve) {
    return <>Empty data</>;
  }

  return (
    <>
      <Box sx={{ mt: 12, mb: 24, color: 'common.white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: '18px' }}>
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
            <MarketLogo size={20} logo={network.networkLogoPath} withAAVELogo={withAAVELogo} />
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
          </TopInfoPanelItem>
        </Box>
      </Box>
    </>
  );
};
