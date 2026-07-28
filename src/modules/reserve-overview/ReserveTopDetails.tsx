import { Trans } from '@lingui/macro';
import { useMediaQuery, useTheme } from '@mui/material';
import { PageHeaderStat } from 'src/components/PageHeader/PageHeaderStat';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { assetIsBorrowableOnMarket } from 'src/utils/getMaxAmountAvailableToBorrow';

import {
  ComputedReserveData,
  useAppDataContext,
} from '../../hooks/app-data-provider/useAppDataProvider';

interface ReserveTopDetailsProps {
  underlyingAsset: string;
}

export const ReserveTopDetails = ({ underlyingAsset }: ReserveTopDetailsProps) => {
  const { reserves, loading } = useAppDataContext();

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
        <FormattedNumber
          value={poolReserve?.priceInUSD}
          symbol="USD"
          variant={valueTypographyVariant}
        />
      </PageHeaderStat>
    </>
  );
};
