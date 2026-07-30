import { Trans } from '@lingui/macro';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ArrowUpRightIcon } from 'src/components/icons/ArrowUpRightIcon';
import { PageHeaderStat } from 'src/components/PageHeader/PageHeaderStat';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';
import { assetIsBorrowableOnMarket } from 'src/utils/getMaxAmountAvailableToBorrow';
import { useShallow } from 'zustand/shallow';

import {
  ComputedReserveData,
  useAppDataContext,
} from '../../hooks/app-data-provider/useAppDataProvider';
import { ReserveHeaderIconButton } from './ReserveHeaderIconButton';

interface ReserveTopDetailsProps {
  underlyingAsset: string;
}

export const ReserveTopDetails = ({ underlyingAsset }: ReserveTopDetailsProps) => {
  const { reserves, loading } = useAppDataContext();
  const [trackEvent, currentNetworkConfig] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentNetworkConfig])
  );

  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  const valueTypographyVariant = downToSM ? 'h4' : 'h2';

  return (
    <>
      <PageHeaderStat label={<Trans>Reserve size</Trans>} loading={loading}>
        <FormattedNumber
          value={Math.max(Number(poolReserve?.totalLiquidityUSD), 0)}
          symbol="USD"
          variant={valueTypographyVariant}
        />
      </PageHeaderStat>

      <PageHeaderStat label={<Trans>Available liquidity</Trans>} loading={loading}>
        <FormattedNumber
          value={
            poolReserve && assetIsBorrowableOnMarket(poolReserve)
              ? Math.max(Number(poolReserve?.availableLiquidityUSD), 0)
              : 0
          }
          symbol="USD"
          variant={valueTypographyVariant}
        />
      </PageHeaderStat>

      <PageHeaderStat label={<Trans>Utilization rate</Trans>} loading={loading}>
        <FormattedNumber
          value={poolReserve?.borrowUsageRatio}
          percent
          variant={valueTypographyVariant}
        />
      </PageHeaderStat>

      <PageHeaderStat label={<Trans>Oracle price</Trans>} loading={loading}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <FormattedNumber
            value={poolReserve?.priceInUSD}
            symbol="USD"
            variant={valueTypographyVariant}
          />
          <ReserveHeaderIconButton tooltipText="View oracle contract" size="1.25rem">
            <Link
              onClick={() =>
                trackEvent(GENERAL.EXTERNAL_LINK, {
                  Link: 'Oracle Price',
                  oracle: poolReserve?.priceOracle,
                  assetName: poolReserve.name,
                  asset: poolReserve.underlyingAsset,
                })
              }
              href={currentNetworkConfig.explorerLinkBuilder({
                address: poolReserve?.priceOracle,
              })}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                color: 'inherit',
              }}
            >
              <ArrowUpRightIcon sx={{ fontSize: '16px' }} />
            </Link>
          </ReserveHeaderIconButton>
        </Box>
      </PageHeaderStat>
    </>
  );
};
