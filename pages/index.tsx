import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import Container from '@mui/material/Container';
import { useState } from 'react';

import { ConnectWalletPaper } from '../src/components/ConnectWalletPaper';
import { useAppDataContext } from '../src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from '../src/hooks/useProtocolDataContext';
import { MainLayout } from '../src/layouts/MainLayout';
import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';
import { DashboardContentWrapper } from '../src/modules/dashboard/DashboardContentWrapper';
import { DashboardTopPanel } from '../src/modules/dashboard/DashboardTopPanel';
import { BorrowedPositionsItem } from '../src/modules/dashboard/lists/BorrowedPositionsList/types';
import { SuppliedPositionsItem } from '../src/modules/dashboard/lists/SuppliedPositionsList/types';

export default function Home() {
  const { currentAccount } = useWeb3Context();
  const { currentNetworkConfig } = useProtocolDataContext();
  const { user, reserves } = useAppDataContext();

  const [isBorrow, setIsBorrow] = useState(false);

  const suppliedPositions: SuppliedPositionsItem[] = [];
  const borrowedPositions: BorrowedPositionsItem[] = [];

  user?.userReservesData.forEach((userReserve) => {
    const poolReserve = reserves.find((res) => res.symbol === userReserve.reserve.symbol);
    if (!poolReserve) {
      throw new Error('data is inconsistent pool reserve is not available');
    }

    const baseListData = {
      isActive: poolReserve.isActive,
      isFrozen: poolReserve.isFrozen,
      reserve: {
        ...userReserve.reserve,
        liquidityRate: poolReserve.supplyAPY,
        // this is a hack to repay with mainAsset instead of the wrappedpooltoken
        symbol:
          poolReserve.symbol.toLowerCase() ===
          currentNetworkConfig.wrappedBaseAssetSymbol?.toLowerCase()
            ? currentNetworkConfig.baseAssetSymbol
            : poolReserve.symbol,
        underlyingAsset:
          poolReserve.symbol.toLowerCase() ===
          currentNetworkConfig.wrappedBaseAssetSymbol?.toLowerCase()
            ? API_ETH_MOCK_ADDRESS
            : poolReserve.underlyingAsset,
        iconSymbol: poolReserve.iconSymbol,
      },
    };

    suppliedPositions.push({
      ...baseListData,
      usageAsCollateralEnabledOnUser: userReserve.usageAsCollateralEnabledOnUser,
      canBeEnabledAsCollateral:
        poolReserve.usageAsCollateralEnabled &&
        ((!poolReserve.isIsolated && !user?.isInIsolationMode) ||
          user?.isolatedReserve?.underlyingAsset === poolReserve.underlyingAsset ||
          (poolReserve.isIsolated && user?.totalCollateralMarketReferenceCurrency === '0')),
      underlyingBalance: userReserve.underlyingBalance,
      underlyingBalanceUSD: userReserve.underlyingBalanceUSD,
      isIsolated: poolReserve.isIsolated,
      aIncentives: poolReserve.aIncentivesData ? poolReserve.aIncentivesData : [],
    });

    if (userReserve.variableBorrows !== '0') {
      borrowedPositions.push({
        ...baseListData,
        stableBorrowRateEnabled: poolReserve.stableBorrowRateEnabled,
        borrowingEnabled: poolReserve.borrowingEnabled,
        currentBorrows: userReserve.variableBorrows,
        currentBorrowsUSD: userReserve.variableBorrowsUSD,
        borrowRateMode: InterestRate.Variable,
        borrowRate: poolReserve.variableBorrowAPY,
        vIncentives: poolReserve.vIncentivesData ? poolReserve.vIncentivesData : [],
        sIncentives: poolReserve.sIncentivesData ? poolReserve.sIncentivesData : [],
      });
    }
    if (userReserve.stableBorrows !== '0') {
      borrowedPositions.push({
        ...baseListData,
        stableBorrowRateEnabled: poolReserve.stableBorrowRateEnabled,
        borrowingEnabled: poolReserve.borrowingEnabled && poolReserve.stableBorrowRateEnabled,
        currentBorrows: userReserve.stableBorrows,
        currentBorrowsUSD: userReserve.stableBorrowsUSD,
        borrowRateMode: InterestRate.Stable,
        borrowRate: userReserve.stableBorrowAPY,
        vIncentives: poolReserve.vIncentivesData ? poolReserve.vIncentivesData : [],
        sIncentives: poolReserve.sIncentivesData ? poolReserve.sIncentivesData : [],
      });
    }
  });

  return (
    <Container maxWidth="lg">
      <DashboardTopPanel
        user={user}
        currentAccount={currentAccount}
        bridge={currentNetworkConfig.bridge}
      />

      {currentAccount ? (
        <DashboardContentWrapper
          suppliedPositions={suppliedPositions}
          borrowedPositions={borrowedPositions}
          isBorrow={isBorrow}
          user={user}
        />
      ) : (
        <ConnectWalletPaper />
      )}
    </Container>
  );
}

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
