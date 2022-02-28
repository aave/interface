import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackOutlined';
import { Box, Button, Skeleton, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
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

import CubeIcon from '../../../public/icons/markets/cube-icon.svg';
import PieIcon from '../../../public/icons/markets/pie-icon.svg';
import UptrendIcon from '../../../public/icons/markets/uptrend-icon.svg';
import DollarIcon from '../../../public/icons/markets/dollar-icon.svg';

interface ReserveTopDetailsProps {
  underlyingAsset: string;
}

export const ReserveTopDetails = ({ underlyingAsset }: ReserveTopDetailsProps) => {
  const router = useRouter();
  const { reserves, loading } = useAppDataContext();
  const { currentMarket, currentNetworkConfig } = useProtocolDataContext();
  const { market, network } = getMarketInfoById(currentMarket);

  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  const valueTypographyVariant = downToSM ? 'main16' : 'main21';
  const symbolsTypographyVariant = downToSM ? 'secondary16' : 'secondary21';

  const ReserveIcon = () => {
    return (
      <Box mr={3} sx={{ mr: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <Skeleton variant="circular" width={40} height={40} sx={{ background: '#383D51' }} />
        ) : (
          <img
            src={`/icons/tokens/${poolReserve.iconSymbol.toLowerCase()}.svg`}
            width="40px"
            height="40px"
            alt=""
          />
        )}
      </Box>
    );
  };

  const ReserveName = () => {
    return loading ? (
      <Skeleton width={60} height={28} sx={{ background: '#383D51' }} />
    ) : (
      <Typography variant={valueTypographyVariant}>{poolReserve.name}</Typography>
    );
  };

  return (
    <TopInfoPanel
      titleComponent={
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, minHeight: '40px' }}>
            <Button
              variant="surface"
              size="medium"
              color="primary"
              startIcon={
                <SvgIcon sx={{ fontSize: '20px' }}>
                  <ArrowBackRoundedIcon />
                </SvgIcon>
              }
              onClick={() => router.back()}
              sx={{ mr: 3 }}
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

          {downToSM && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
              <ReserveIcon />
              <Box>
                {!loading && (
                  <Typography sx={{ color: '#A5A8B6' }} variant="caption">
                    {poolReserve.symbol}
                  </Typography>
                )}

                <ReserveName />
              </Box>
            </Box>
          )}
        </Box>
      }
    >
      {!downToSM && (
        <TopInfoPanelItem
          title={!loading && <Trans>{poolReserve.symbol}</Trans>}
          withoutIconWrapper
          icon={<ReserveIcon />}
          loading={loading}
        >
          <ReserveName />
        </TopInfoPanelItem>
      )}

      <TopInfoPanelItem icon={<CubeIcon />} title={<Trans>Reserve Size</Trans>} loading={loading}>
        <FormattedNumber
          value={poolReserve?.totalLiquidityUSD}
          symbol="USD"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#A5A8B6"
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem
        icon={<PieIcon />}
        title={<Trans>Available liquidity</Trans>}
        loading={loading}
      >
        <FormattedNumber
          value={poolReserve?.availableLiquidityUSD}
          symbol="USD"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#A5A8B6"
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem
        icon={<UptrendIcon />}
        title={<Trans>Utilization Rate</Trans>}
        loading={loading}
      >
        <FormattedNumber
          value={poolReserve?.utilizationRate}
          percent
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#A5A8B6"
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem
        icon={<DollarIcon />}
        title={<Trans>Oracle price</Trans>}
        titleIcon={
          loading ? (
            <Skeleton width={16} height={16} sx={{ ml: 1, background: '#383D51' }} />
          ) : (
            <Link
              href={currentNetworkConfig.explorerLinkBuilder({ address: poolReserve?.priceOracle })}
              sx={{ display: 'inline-flex', alignItems: 'center', ml: 1, color: '#A5A8B6' }}
            >
              <SvgIcon sx={{ fontSize: '16px' }}>
                <ExternalLinkIcon />
              </SvgIcon>
            </Link>
          )
        }
        loading={loading}
      >
        <FormattedNumber
          value={poolReserve?.priceInUSD}
          symbol="USD"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#A5A8B6"
        />
      </TopInfoPanelItem>
    </TopInfoPanel>
  );
};
