import { Skeleton } from '@mui/material';
import { AssetGroup } from 'src/components/AssetGroup';
import { NoData } from 'src/components/primitives/NoData';
import { usePoolFormattedReserves } from 'src/hooks/pool/usePoolFormattedReserves';
import { MarketDataType } from 'src/ui-config/marketsConfig';

interface V3CollateralExposureProps {
  market: MarketDataType;
  max?: number;
}

/**
 * The assets that can back debt on a V3 market, the most supplied first: the V3 counterpart of a
 * V4 hub's collateral assets, told the same way.
 */
export const V3CollateralExposure = ({ market, max }: V3CollateralExposureProps) => {
  const { data, isPending } = usePoolFormattedReserves(market);

  if (isPending) {
    return (
      <Skeleton variant="rectangular" width={64} height={12} sx={{ borderRadius: '0.5rem' }} />
    );
  }

  const symbols = (data ?? [])
    .filter((reserve) => reserve.usageAsCollateralEnabled && reserve.baseLTVasCollateral !== '0')
    .sort((a, b) => Number(b.totalLiquidityUSD) - Number(a.totalLiquidityUSD))
    .map((reserve) => reserve.iconSymbol);

  return symbols.length ? (
    <AssetGroup symbols={symbols} max={max} size={20} />
  ) : (
    <NoData color="fg-4" />
  );
};
