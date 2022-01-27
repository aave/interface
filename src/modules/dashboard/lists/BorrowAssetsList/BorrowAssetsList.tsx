import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';

import { BorrowAvailableInfoContent } from '../../../../components/infoModalContents/BorrowAvailableInfoContent';
import { useAppDataContext } from '../../../../hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from '../../../../hooks/useProtocolDataContext';
import { getMaxAmountAvailableToBorrow } from '../../../../utils/getMaxAmountAvailableToBorrow';
import { DashboardContentNoData } from '../../DashboardContentNoData';
import { DashboardListWrapper } from '../../DashboardListWrapper';
import { BorrowedPositionsItem } from '../BorrowedPositionsList/types';
import { ListHeader } from '../ListHeader';
import { BorrowAssetsListItem } from './BorrowAssetsListItem';
import { BorrowAssetsItem } from './types';

interface BorrowAssetsListProps {
  borrowedReserves: BorrowedPositionsItem[];
}

export const BorrowAssetsList = ({ borrowedReserves }: BorrowAssetsListProps) => {
  const { currentNetworkConfig } = useProtocolDataContext();
  const { user, reserves, marketReferencePriceInUsd, userEmodeCategoryId } = useAppDataContext();

  const { wrappedBaseAssetSymbol, baseAssetSymbol } = currentNetworkConfig;

  const tokensToBorrow: BorrowAssetsItem[] = reserves.map<BorrowAssetsItem>((reserve) => {
    const availableBorrows = user ? getMaxAmountAvailableToBorrow(reserve, user).toNumber() : 0;

    const availableBorrowsInUSD = valueToBigNumber(availableBorrows)
      .multipliedBy(reserve.priceInMarketReferenceCurrency)
      .multipliedBy(marketReferencePriceInUsd)
      .shiftedBy(-USD_DECIMALS)
      .toFixed(2);

    return {
      ...reserve,
      currentBorrows:
        user?.userReservesData.find((userReserve) => userReserve.reserve.id === reserve.id)
          ?.totalBorrows || '0',
      currentBorrowsInUSD:
        user?.userReservesData.find((userReserve) => userReserve.reserve.id === reserve.id)
          ?.totalBorrowsUSD || '0',
      totalBorrows: reserve.totalDebt,
      availableBorrows,
      availableBorrowsInUSD,
      stableBorrowRate:
        reserve.stableBorrowRateEnabled && reserve.borrowingEnabled
          ? Number(reserve.stableBorrowAPY)
          : -1,
      variableBorrowRate: reserve.borrowingEnabled ? Number(reserve.variableBorrowAPY) : -1,
      interestHistory: [],
      aIncentives: reserve.aIncentivesData ? reserve.aIncentivesData : [],
      vIncentives: reserve.vIncentivesData ? reserve.vIncentivesData : [],
      sIncentives: reserve.sIncentivesData ? reserve.sIncentivesData : [],
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

  const isEModeActive = userEmodeCategoryId !== 0;

  const filteredBorrowReserves = tokensToBorrow
    .filter(({ borrowingEnabled, isActive, borrowableInIsolation, eModeCategoryId }) => {
      if (!isEModeActive) {
        return (
          (borrowingEnabled && isActive && !user?.isInIsolationMode) ||
          (user?.isInIsolationMode && borrowableInIsolation)
        );
      } else {
        return (
          (eModeCategoryId === userEmodeCategoryId &&
            borrowingEnabled &&
            isActive &&
            !user?.isInIsolationMode) ||
          (eModeCategoryId === userEmodeCategoryId &&
            user?.isInIsolationMode &&
            borrowableInIsolation)
        );
      }
    })
    .sort((a, b) => (+a.availableBorrowsInUSD > +b.availableBorrowsInUSD ? -1 : 0));

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
      ? filteredBorrowReserves
      : filteredBorrowReserves.filter(
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
      {!borrowedReserves.length && (
        <DashboardListWrapper
          title={<Trans>Your borrows</Trans>}
          localStorageName="borrowAssetsDashboardTableCollapse"
          noData={true}
        >
          <DashboardContentNoData text={<Trans>Nothing borrowed yet</Trans>} />
        </DashboardListWrapper>
      )}

      {!!tokensToBorrow.length && (
        <DashboardListWrapper
          title={<Trans>Assets to borrow</Trans>}
          localStorageName="borrowAssetsDashboardTableCollapse"
          withTopMargin
        >
          <>
            <ListHeader head={head} />
            {borrowReserves.map((item, index) => (
              <BorrowAssetsListItem {...item} key={index} />
            ))}
          </>
        </DashboardListWrapper>
      )}
    </>
  );
};
