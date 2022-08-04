import { Box, Divider, Skeleton, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { Link, ROUTES } from '../primitives/Link';
import { TokenIcon } from '../primitives/TokenIcon';
import getAssetCapUsage from 'src/hooks/getAssetCapUsage';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

interface ListMobileItemProps {
  warningComponent?: ReactNode;
  children: ReactNode;
  symbol?: string;
  iconSymbol?: string;
  name?: string;
  underlyingAsset?: string;
  loading?: boolean;
  currentMarket?: CustomMarket;
  reserve?: ComputedReserveData;
  showSupplyCapTooltips?: boolean;
  showBorrowCapTooltips?: boolean;
  showDebtCeilingTooltips?: boolean;
}

export const ListMobileItem = ({
  children,
  warningComponent,
  symbol,
  iconSymbol,
  name,
  underlyingAsset,
  loading,
  currentMarket,
  reserve,
  showSupplyCapTooltips = false,
  showBorrowCapTooltips = false,
  showDebtCeilingTooltips = false,
}: ListMobileItemProps) => {
  const { supplyCap, borrowCap, debtCeiling } = getAssetCapUsage(reserve);

  return (
    <Box>
      <Divider />
      <Box sx={{ px: 4, pt: 4, pb: 6 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          {loading ? (
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ ml: 2 }}>
                <Skeleton width={100} height={24} />
              </Box>
            </Box>
          ) : (
            symbol &&
            underlyingAsset &&
            name &&
            currentMarket &&
            iconSymbol && (
              <Link
                href={ROUTES.reserveOverview(underlyingAsset, currentMarket)}
                sx={{ display: 'inline-flex', alignItems: 'center' }}
              >
                <TokenIcon symbol={iconSymbol} sx={{ fontSize: '40px' }} />
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h4">{name}</Typography>
                  <Typography variant="subheader2" color="text.muted">
                    {symbol}
                  </Typography>
                </Box>
                {showSupplyCapTooltips &&
                  supplyCap.isMaxed &&
                  supplyCap.determineTooltipDisplay({ supplyCap })}
                {showBorrowCapTooltips &&
                  borrowCap.isMaxed &&
                  borrowCap.determineTooltipDisplay({ borrowCap })}
                {showDebtCeilingTooltips &&
                  debtCeiling.isMaxed &&
                  debtCeiling.determineTooltipDisplay({ debtCeiling })}
              </Link>
            )
          )}
          {warningComponent}
        </Box>
        {children}
      </Box>
    </Box>
  );
};
