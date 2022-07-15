import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Alert, Box, useMediaQuery, useTheme } from '@mui/material';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';

import { CapType } from '../../../../components/caps/helper';
import { AvailableTooltip } from '../../../../components/infoTooltips/AvailableTooltip';
import { ListWrapper } from '../../../../components/lists/ListWrapper';
import { useAppDataContext } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from '../../../../hooks/useProtocolDataContext';
import {
  assetCanBeBorrowedByUser,
  getMaxAmountAvailableToBorrow,
} from '../../../../utils/getMaxAmountAvailableToBorrow';
import { ListHeader } from '../ListHeader';
import { ListLoader } from '../ListLoader';
import { BorrowAssetsListItem } from './BorrowAssetsListItem';
import { BorrowAssetsListMobileItem } from './BorrowAssetsListMobileItem';
import { BorrowAssetsItem } from './types';
import { Link } from '../../../../components/primitives/Link';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { StableAPYTooltip } from 'src/components/infoTooltips/StableAPYTooltip';

export const BorrowAssetsList = () => {
  const { currentNetworkConfig } = useProtocolDataContext();
  const { user, reserves, marketReferencePriceInUsd, loading } = useAppDataContext();
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const { baseAssetSymbol } = currentNetworkConfig;

  const tokensToBorrow: BorrowAssetsItem[] = reserves
    .filter((reserve) => assetCanBeBorrowedByUser(reserve, user))
    .map<BorrowAssetsItem>((reserve) => {
      const availableBorrows = user
        ? getMaxAmountAvailableToBorrow(reserve, user, InterestRate.Variable).toNumber()
        : 0;

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
        iconSymbol: reserve.iconSymbol,
        ...(reserve.isWrappedBaseAsset
          ? fetchIconSymbolAndName({
              symbol: baseAssetSymbol,
              underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
            })
          : {}),
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
    <AvailableTooltip
      capType={CapType.borrowCap}
      text={<Trans>Available</Trans>}
      key="Available"
      variant="subheader2"
    />,
    <VariableAPYTooltip
      text={<Trans>APY, variable</Trans>}
      key="APY_dash_variable_ type"
      variant="subheader2"
    />,
    <StableAPYTooltip
      text={<Trans>APY, stable</Trans>}
      key="APY_dash_stable_ type"
      variant="subheader2"
    />,
  ];

  if (loading)
    return <ListLoader title={<Trans>Assets to borrow</Trans>} head={head} withTopMargin />;

  return (
    <>
      {!!tokensToBorrow.length && (
        <ListWrapper
          title={<Trans>Assets to borrow</Trans>}
          localStorageName="borrowAssetsDashboardTableCollapse"
          withTopMargin
          subChildrenComponent={
            <Box sx={{ px: 6, mb: 4 }}>
              {+collateralUsagePercent >= 0.98 && (
                <Alert sx={{ mb: '12px' }} severity="error">
                  <Trans>
                    Be careful - You are very close to liquidation. Consider depositing more
                    collateral or paying down some of your borrowed positions
                  </Trans>
                </Alert>
              )}
              {user?.isInIsolationMode && (
                <Alert sx={{ mb: '12px' }} severity="warning">
                  <Trans>Borrowing power and assets are limited due to Isolation mode. </Trans>
                  <Link href="https://docs.aave.com/faq/" target="_blank" rel="noopener">
                    Learn More
                  </Link>
                </Alert>
              )}
              {user?.isInEmode && (
                <Alert sx={{ mb: '12px' }} severity="warning">
                  <Trans>
                    In E-Mode some assets are not borrowable. Exit E-Mode to get access to all
                    assets
                  </Trans>
                </Alert>
              )}
              {user?.totalCollateralMarketReferenceCurrency === '0' && (
                <Alert severity="info">
                  <Trans>To borrow you need to supply any asset to be used as collateral.</Trans>
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
