import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Alert, Box, useMediaQuery, useTheme } from '@mui/material';

import { BorrowAvailableInfoContent } from '../../../../components/infoModalContents/BorrowAvailableInfoContent';
import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { useAppDataContext } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from '../../../../hooks/useProtocolDataContext';
import {
  assetCanBeBorrowedByUser,
  getMaxAmountAvailableToBorrow,
} from '../../../../utils/getMaxAmountAvailableToBorrow';
import { ListHeader } from '../ListHeader';
import { BorrowAssetsListItem } from './BorrowAssetsListItem';
import { BorrowAssetsListMobileItem } from './BorrowAssetsListMobileItem';
import { BorrowAssetsItem } from './types';

export const BorrowAssetsList = () => {
  const { currentNetworkConfig } = useProtocolDataContext();
  const { user, reserves, marketReferencePriceInUsd } = useAppDataContext();
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const { wrappedBaseAssetSymbol, baseAssetSymbol } = currentNetworkConfig;

  const tokensToBorrow: BorrowAssetsItem[] = reserves
    .filter((reserve) => assetCanBeBorrowedByUser(reserve, user))
    .map<BorrowAssetsItem>((reserve) => {
      const availableBorrows = user ? getMaxAmountAvailableToBorrow(reserve, user).toNumber() : 0;

      const availableBorrowsInUSD = valueToBigNumber(availableBorrows)
        .multipliedBy(reserve.formattedPriceInMarketReferenceCurrency)
        .multipliedBy(marketReferencePriceInUsd)
        .shiftedBy(-USD_DECIMALS)
        .toFixed(2);

      return {
        ...reserve,
        totalBorrows: reserve.totalDebt,
        availableBorrows,
        availableBorrowsInUSD,
        stableBorrowRate:
          reserve.stableBorrowRateEnabled && reserve.borrowingEnabled
            ? Number(reserve.stableBorrowAPY)
            : -1,
        variableBorrowRate: reserve.borrowingEnabled ? Number(reserve.variableBorrowAPY) : -1,
        symbol:
          reserve.symbol.toLowerCase() === wrappedBaseAssetSymbol?.toLowerCase()
            ? baseAssetSymbol
            : reserve.symbol,
        iconSymbol: reserve.iconSymbol,
        underlyingAsset:
          reserve.symbol.toLowerCase() === wrappedBaseAssetSymbol?.toLowerCase()
            ? API_ETH_MOCK_ADDRESS.toLowerCase()
            : reserve.underlyingAsset,
      };
    });

  const maxBorrowAmount = valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || '0').plus(
    user?.availableBorrowsMarketReferenceCurrency || '0'
  );
  const collateralUsagePercent = maxBorrowAmount.eq(0)
    ? '0'
    : valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || '0')
        .div(maxBorrowAmount)
        .toFixed();

  const borrowReserves =
    user?.totalCollateralMarketReferenceCurrency === '0' || +collateralUsagePercent >= 0.98
      ? tokensToBorrow
      : tokensToBorrow.filter(
          ({ availableBorrowsInUSD, totalLiquidityUSD }) =>
            availableBorrowsInUSD !== '0.00' && totalLiquidityUSD !== '0'
        );

  const head = [
    <BorrowAvailableInfoContent
      text={<Trans>Available</Trans>}
      key="Available"
      variant="subheader2"
    />,
    <Trans key="APY, variable">APY, variable</Trans>,
    <Trans key="APY, stable">APY, stable</Trans>,
  ];

  return (
    <>
      {!!tokensToBorrow.length && (
        <ListWrapper
          title={<Trans>Assets to borrow</Trans>}
          localStorageName="borrowAssetsDashboardTableCollapse"
          withTopMargin
          subChildrenComponent={
            <Box sx={{ px: 6, mb: 4 }}>
              {user?.totalCollateralMarketReferenceCurrency === '0' && (
                <Alert severity="info">
                  <Trans>To borrow you need to supply any asset to be used as collateral.</Trans>
                </Alert>
              )}
              {user?.isInIsolationMode && (
                <Alert severity="warning">
                  <Trans>Borrowing power and assets are limited due to Isolation mode.</Trans>
                </Alert>
              )}
              {user?.isInEmode && (
                <Alert severity="warning">
                  <Trans>
                    In E-Mode some assets are not borrowable. Exit E-Mode to get access to all
                    assets
                  </Trans>
                </Alert>
              )}
              {+collateralUsagePercent >= 0.98 && (
                <Alert severity="error">
                  <Trans>
                    Be careful - You are very close to liqudation. Consider depositing more
                    collateral or paying down some of your borrowed positions
                  </Trans>
                </Alert>
              )}
            </Box>
          }
        >
          <>
            {!downToXSM && <ListHeader head={head} />}
            {borrowReserves.map((item, index) =>
              downToXSM ? (
                <BorrowAssetsListMobileItem {...item} key={index} />
              ) : (
                <BorrowAssetsListItem {...item} key={index} />
              )
            )}
          </>
        </ListWrapper>
      )}
    </>
  );
};
