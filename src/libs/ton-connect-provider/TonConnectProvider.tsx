import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { ExtendedFormattedUser } from 'src/hooks/pool/useExtendedUserSummaryAndIncentives';
import { TonConnectContext } from 'src/libs/hooks/useTonConnectContext';

export type TonConnectData = {
  isConnectedTonWallet: boolean;
  walletAddressTonWallet: string;
  disconnectTonWallet: () => void;
  connectTonWallet: () => void;
  loadingTonWallet: boolean;
  deactivatedTonWallet: boolean;
  userSummaryTon: ExtendedFormattedUser;
};

export const TonConnectContextProvider: React.FC<{
  children: ReactElement;
}> = ({ children }) => {
  const [isConnectedTonWallet, setIsConnectedTonWallet] = useState<boolean>(false);
  const [walletAddressTonWallet, setWalletAddressTonWallet] = useState<string>('');
  const [loadingTonWallet, setLoadingTonWallet] = useState<boolean>(false);
  const [deactivatedTonWallet, setDeactivatedTonWallet] = useState<boolean>(false);
  const wallet = useTonWallet();
  const userFriendlyAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const userSummaryTon = {
    userReservesData: [
      {
        id: '10-0x6385fb98e0ae7bd76b55a044e1635244e46b07ef-0x94b008aa00579c1307b0ef2c499ad98a8ce58e58-0xa97684ead0e402dc232d5a977953df7ecbab3cdb',
        underlyingAsset: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
        scaledATokenBalance: '451047',
        usageAsCollateralEnabledOnUser: false,
        stableBorrowRate: '0',
        scaledVariableDebt: '1',
        principalStableDebt: '0',
        stableBorrowLastUpdateTimestamp: 0,
        reserve: {
          id: '10-0x94b008aa00579c1307b0ef2c499ad98a8ce58e58-0xa97684ead0e402dc232d5a977953df7ecbab3cdb',
          underlyingAsset: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
          name: 'Tether',
          symbol: 'USDT',
          decimals: 6,
          baseLTVasCollateral: '7500',
          reserveLiquidationThreshold: '7800',
          reserveLiquidationBonus: '10500',
          reserveFactor: '0.1',
          usageAsCollateralEnabled: true,
          borrowingEnabled: true,
          stableBorrowRateEnabled: false,
          isActive: true,
          isFrozen: false,
          liquidityIndex: '1129513270495822059930074878',
          variableBorrowIndex: '1174332500820351032408267014',
          liquidityRate: '51050995060942946309836291',
          variableBorrowRate: '64148289314070639553577627',
          stableBorrowRate: '0',
          lastUpdateTimestamp: 1722334669,
          aTokenAddress: '0x6ab707Aca953eDAeFBc4fD23bA73294241490620',
          stableDebtTokenAddress: '0x70eFfc565DB6EEf7B927610155602d31b670e802',
          variableDebtTokenAddress: '0xfb00AC187a8Eb5AFAE4eACE434F493Eb62672df7',
          interestRateStrategyAddress: '0xC2c6DF6a8B6cc79a6F927a1FFAE602c701C374Ea',
          availableLiquidity: '1375588430892',
          totalPrincipalStableDebt: '387389.777626',
          averageStableRate: '56123241884751810379202048',
          stableDebtLastUpdateTimestamp: 1720170715,
          totalScaledVariableDebt: '8975181.515701',
          priceInMarketReferenceCurrency: '99981000',
          priceOracle: '0x70E6DBBFFc9c3c6fB4a9c349E3101B7dCEE67f4D',
          variableRateSlope1: '0',
          variableRateSlope2: '0',
          stableRateSlope1: '0',
          stableRateSlope2: '0',
          baseStableBorrowRate: '0',
          baseVariableBorrowRate: '0',
          optimalUsageRatio: '0',
          isPaused: false,
          debtCeiling: '0',
          eModeCategoryId: 1,
          borrowCap: '16000000',
          supplyCap: '25000000',
          eModeLtv: 9000,
          eModeLiquidationThreshold: 9300,
          eModeLiquidationBonus: 10100,
          eModePriceSource: '0x0000000000000000000000000000000000000000',
          eModeLabel: 'Stablecoins',
          borrowableInIsolation: true,
          accruedToTreasury: '235190864',
          unbacked: '0',
          isolationModeTotalDebt: '0',
          debtCeilingDecimals: 2,
          isSiloedBorrowing: false,
          flashLoanEnabled: true,
          totalDebt: '10928743.436131',
          totalStableDebt: '388884.890104',
          totalVariableDebt: '10539858.546027',
          totalLiquidity: '12304331.867023',
          borrowUsageRatio: '0.8882029153830991458',
          supplyUsageRatio: '0.8882029153830991458',
          formattedReserveLiquidationBonus: '0.05',
          formattedEModeLiquidationBonus: '0.01',
          formattedEModeLiquidationThreshold: '0.93',
          formattedEModeLtv: '0.9',
          supplyAPY: '0.05237655787809731862',
          variableBorrowAPY: '0.06625050052460462903',
          stableBorrowAPY: '0',
          formattedAvailableLiquidity: '1375588.430892',
          unborrowedLiquidity: '1375588.430892',
          formattedBaseLTVasCollateral: '0.75',
          supplyAPR: '0.05105099506094294631',
          variableBorrowAPR: '0.06414828931407063955',
          stableBorrowAPR: '0',
          formattedReserveLiquidationThreshold: '0.78',
          debtCeilingUSD: '0',
          isolationModeTotalDebtUSD: '0',
          availableDebtCeilingUSD: '0',
          isIsolated: false,
          totalLiquidityUSD: '12301994.04396826563',
          availableLiquidityUSD: '1375327.06909013052',
          totalDebtUSD: '10926666.97487813511',
          totalVariableDebtUSD: '10537855.97290325487',
          totalStableDebtUSD: '388811.00197488024',
          formattedPriceInMarketReferenceCurrency: '0.99981',
          priceInUSD: '0.99981',
          borrowCapUSD: '15996960',
          supplyCapUSD: '24995250',
          unbackedUSD: '0',
          aIncentivesData: [
            {
              incentiveAPR: '0',
              rewardTokenAddress: '0x4200000000000000000000000000000000000042',
              rewardTokenSymbol: 'OP',
            },
          ],
          vIncentivesData: [
            {
              incentiveAPR: '0',
              rewardTokenAddress: '0x4200000000000000000000000000000000000042',
              rewardTokenSymbol: 'OP',
            },
          ],
          sIncentivesData: [],
          iconSymbol: 'USDT',
          isEmodeEnabled: true,
          isWrappedBaseAsset: false,
        },
        underlyingBalance: '0.509464',
        underlyingBalanceMarketReferenceCurrency: '0.50936720184',
        underlyingBalanceUSD: '0.50936720184',
        stableBorrows: '0',
        stableBorrowsMarketReferenceCurrency: '0',
        stableBorrowsUSD: '0',
        variableBorrows: '0.000001',
        variableBorrowsMarketReferenceCurrency: '0.00000099981',
        variableBorrowsUSD: '9.9981e-7',
        totalBorrows: '0.000001',
        totalBorrowsMarketReferenceCurrency: '0.00000099981',
        totalBorrowsUSD: '9.9981e-7',
        stableBorrowAPR: '0',
        stableBorrowAPY: '0',
        supplyAPY: '0.05237655787809731862',
      },
    ],
    totalLiquidityMarketReferenceCurrency: '0',
    totalLiquidityUSD: '0',
    totalCollateralMarketReferenceCurrency: '0',
    totalCollateralUSD: '0',
    totalBorrowsMarketReferenceCurrency: '0',
    totalBorrowsUSD: '0',
    netWorthUSD: '0',
    availableBorrowsMarketReferenceCurrency: '0',
    availableBorrowsUSD: '0',
    currentLoanToValue: '0',
    currentLiquidationThreshold: '0',
    healthFactor: '-1',
    isInIsolationMode: false,
    calculatedUserIncentives: {},
    userEmodeCategoryId: 0,
    isInEmode: false,
    earnedAPY: 0,
    debtAPY: 0,
    netAPY: 0,
  };

  useEffect(() => {
    if (wallet) {
      setIsConnectedTonWallet(true);
      setWalletAddressTonWallet(userFriendlyAddress);
    } else {
      setIsConnectedTonWallet(false);
      setWalletAddressTonWallet('');
    }
  }, [wallet, userFriendlyAddress]);

  const disconnectTonWallet = useCallback(async () => {
    setLoadingTonWallet(true);
    if (tonConnectUI) {
      tonConnectUI.disconnect();
      setLoadingTonWallet(false);
      setDeactivatedTonWallet(true);
      setIsConnectedTonWallet(false);
      setWalletAddressTonWallet('');
    }
  }, [tonConnectUI]);

  const connectTonWallet = useCallback(async () => {
    if (tonConnectUI) {
      tonConnectUI.openModal();
    }
  }, [tonConnectUI]);

  return (
    <TonConnectContext.Provider
      value={{
        tonConnectProviderData: {
          isConnectedTonWallet,
          walletAddressTonWallet,
          disconnectTonWallet,
          connectTonWallet,
          loadingTonWallet,
          deactivatedTonWallet,
          userSummaryTon,
        },
      }}
    >
      {children}
    </TonConnectContext.Provider>
  );
};
