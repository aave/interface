import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import Container from '@mui/material/Container';
import { useState } from 'react';

import { ConnectWalletPaper } from '../src/components/ConnectWalletPaper';
import { useAppDataContext } from '../src/hooks/app-data-provider/useAppDataProvider';
import { MainLayout } from '../src/layouts/MainLayout';
import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';
import { DashboardContentWrapper } from '../src/modules/dashboard/DashboardContentWrapper';
import { DashboardTopPanel } from '../src/modules/dashboard/DashboardTopPanel';
import { BorrowedPositionsItem } from '../src/modules/dashboard/lists/BorrowedPositionsList/types';
import { SuppliedPositionsItem } from '../src/modules/dashboard/lists/SuppliedPositionsList/types';
import { getNetworkConfig } from '../src/utils/marketsAndNetworksConfig';

export default function Home() {
  const { currentAccount, chainId } = useWeb3Context();
  const { user, reserves } = useAppDataContext();
  const networkConfig = getNetworkConfig(chainId);

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
          poolReserve.symbol.toLowerCase() === networkConfig.wrappedBaseAssetSymbol?.toLowerCase()
            ? networkConfig.baseAssetSymbol
            : poolReserve.symbol,
        underlyingAsset:
          poolReserve.symbol.toLowerCase() === networkConfig.wrappedBaseAssetSymbol?.toLowerCase()
            ? API_ETH_MOCK_ADDRESS
            : poolReserve.underlyingAsset,
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
      // onToggleSwitch: () =>
      //   toggleUseAsCollateral(
      //     !userReserve.usageAsCollateralEnabledOnUser,
      //     poolReserve.underlyingAsset
      //   ), TODO
      // swapAction: `/asset-swap?asset=${poolReserve.underlyingAsset}`, TODO
      /**
       * for deposit and withdrawal we pass API_ETH_MOCK_ADDRESS instead of the underlying to automatically unwrap
       */
      // depositAction: `/supply/${
      //   poolReserve.symbol.toLowerCase() === networkConfig.wrappedBaseAssetSymbol?.toLowerCase()
      //     ? API_ETH_MOCK_ADDRESS
      //     : poolReserve.underlyingAsset
      // }`, TODO
      // withdrawAction: `/withdraw/${
      //   poolReserve.symbol.toLowerCase() === networkConfig.wrappedBaseAssetSymbol?.toLowerCase()
      //     ? API_ETH_MOCK_ADDRESS
      //     : poolReserve.underlyingAsset
      // }`, TODO
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
        // repayAction: loanActionLinkComposer(
        //   'repay',
        //   // this is a hack to repay with mainAsset instead of the wrappedpooltoken
        //   poolReserve.symbol.toLowerCase() === networkConfig.wrappedBaseAssetSymbol?.toLowerCase()
        //     ? API_ETH_MOCK_ADDRESS.toLowerCase()
        //     : poolReserve.underlyingAsset,
        //   InterestRate.Variable
        // ), TODO
        // borrowAction: loanActionLinkComposer(
        //   'borrow',
        //   // this is a hack to repay with mainAsset instead of the wrappedpooltoken
        //   poolReserve.symbol.toLowerCase() === networkConfig.wrappedBaseAssetSymbol?.toLowerCase()
        //     ? API_ETH_MOCK_ADDRESS.toLowerCase()
        //     : poolReserve.underlyingAsset,
        //   InterestRate.Variable
        // ), TODO
        // onSwitchToggle: () =>
        //   toggleBorrowRateMode(InterestRate.Variable, poolReserve.underlyingAsset), TODO
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
        // repayAction: loanActionLinkComposer(
        //   'repay',
        //   // this is a hack to repay with mainAsset instead of the wrappedpooltoken
        //   poolReserve.symbol.toLowerCase() === networkConfig.wrappedBaseAssetSymbol?.toLowerCase()
        //     ? API_ETH_MOCK_ADDRESS.toLowerCase()
        //     : poolReserve.underlyingAsset,
        //   InterestRate.Stable
        // ), TODO
        // borrowAction: loanActionLinkComposer(
        //   'borrow',
        //   // this is a hack to repay with mainAsset instead of the wrappedpooltoken
        //   poolReserve.symbol.toLowerCase() === networkConfig.wrappedBaseAssetSymbol?.toLowerCase()
        //     ? API_ETH_MOCK_ADDRESS.toLowerCase()
        //     : poolReserve.underlyingAsset,
        //   InterestRate.Stable
        // ), TODO
        // onSwitchToggle: () =>
        //   toggleBorrowRateMode(InterestRate.Stable, poolReserve.underlyingAsset), TODO
      });
    }
  });

  return (
    <Container maxWidth="lg">
      <DashboardTopPanel user={user} currentAccount={currentAccount} />

      {currentAccount ? (
        <DashboardContentWrapper
          suppliedPositions={suppliedPositions}
          borrowedPositions={borrowedPositions}
          isBorrow={isBorrow}
          isUserInIsolationMode={user?.isInIsolationMode}
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
