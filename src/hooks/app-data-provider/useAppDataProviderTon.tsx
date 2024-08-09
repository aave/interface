import dataAssumeReserves from '@public/assume-reserves.json';
import userTon from '@public/assume-user.json';
import { Address, Cell, ContractProvider, Sender } from '@ton/core';
import { formatUnits } from 'ethers/lib/utils';
import { useCallback, useEffect, useState } from 'react';
import { Pool } from 'src/contracts/Pool';
import { useContract } from 'src/hooks/useContract';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';

import { useTonClient } from '../useTonClient';
import { useGetBalanceTon } from './useWalletBalancesTon';

export interface interfaceSendSupply {
  provider: ContractProvider;
  via: Sender;
  value: bigint;
  jetton_amount: bigint;
  toPool: Address;
  responseAddress: Address; // address of user make tx
  customPayload: Cell; //Cell.EMPTY
  forward_ton_amount: bigint;
  tokenAddress: Address;
}

export interface interfaceContentAssetTon {
  persistenceType: string;
  metadata: MetadataContentAssetTon;
}

export interface MetadataContentAssetTon {
  name: string;
  description: string;
  image: string;
  decimals: string;
  symbol: string;
}

export const address_pools = 'EQDTzCz3Xrt40qJjbw7A4cuQ-xkoeC2uoAuWf-IgzWlJ7fLe';
// export const address_pools = 'EQDQg3KgzAUFf8WSNQz_FUbX6pRnJ2JciFEABwRE4Kipsh3L';
// export const address_pools = 'EQCvM_iN3f_bqO_ADopJ8SR8ix5YT8wDBxfuQQ6B0QNKbhzV';

export function useAppDataProviderTon() {
  const client = useTonClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [listPoolContract, setListPoolContract] = useState<unknown>([]);
  const [reservesTon, setReservesTon] = useState<DashboardReserve[]>([]);
  const poolContract = useContract<Pool>(address_pools, Pool);
  const { onGetBalanceTonNetwork } = useGetBalanceTon();
  const { walletAddressTonWallet } = useTonConnectContext();

  useEffect(() => {
    if (!poolContract) return;
    poolContract.getReservesList().then(setListPoolContract);
  }, [poolContract]);

  const getValueReserve = useCallback(async () => {
    if (!poolContract || !client || !walletAddressTonWallet) return;
    setLoading(true);
    const reserve = await poolContract.getReservesData();
    console.log('reserve----', reserve);
    console.log('reserve----', reserve[0].underlyingAsset.toString());
    const arr = await Promise.all(
      reserve.map(async (item) => {
        const balance = await onGetBalanceTonNetwork(item.underlyingAsset.toString());

        const walletBalance = formatUnits(balance || '0', item.decimals);
        console.log('walletBalance-------', walletBalance);
        console.log('underlyingAsset-----', item.name, '----', item.underlyingAsset.toString());
        return {
          // ...item,
          baseLTVasCollateral: '7450',
          reserveLiquidationThreshold: '7700',
          reserveLiquidationBonus: '10750',
          usageAsCollateralEnabled: true,
          borrowingEnabled: true,
          stableBorrowRateEnabled: false,
          liquidityRate: '31123474726224900471975',
          variableBorrowRate: '2386587374537667364806198',
          stableBorrowRate: '70000000000000000000000000',
          aTokenAddress: '0x1c0E06a0b1A4c160c17545FF2A951bfcA57C0002',
          stableDebtTokenAddress: '0xBDfa7DE5CF7a7DdE4F023Cac842BF520fcF5395C',
          variableDebtTokenAddress: '0x08a8Dc81AeA67F84745623aC6c72CDA3967aab8b',
          interestRateStrategyAddress: '0x48AF11111764E710fcDcE2750db848C63edab57B',
          availableLiquidity: '2314651612891643030158',
          totalPrincipalStableDebt: '0',
          averageStableRate: '0',
          stableDebtLastUpdateTimestamp: 0,
          totalScaledVariableDebt: '36.053394800123496879',
          priceInMarketReferenceCurrency: '352765932594',
          priceOracle: '0xD6270dAabFe4862306190298C2B48fed9e15C847',
          variableRateSlope1: '70000000000000000000000000',
          variableRateSlope2: '3000000000000000000000000000',
          stableRateSlope1: '0',
          stableRateSlope2: '0',
          baseStableBorrowRate: '70000000000000000000000000',
          baseVariableBorrowRate: '0',
          optimalUsageRatio: '450000000000000000000000000',
          eModeCategoryId: 1,
          eModeLtv: 9300,
          eModeLiquidationThreshold: 9500,
          eModeLiquidationBonus: 10100,
          eModePriceSource: '0x0000000000000000000000000000000000000000',
          eModeLabel: 'ETH correlated',
          borrowableInIsolation: false,
          unbacked: '0',
          isolationModeTotalDebt: '0',
          debtCeilingDecimals: 2,
          isSiloedBorrowing: false,
          flashLoanEnabled: true,
          totalDebt: '36.065596887825658831',
          totalStableDebt: '0',
          totalVariableDebt: '36.065596887825658831',
          totalLiquidity: '2350.717209779468688989',
          borrowUsageRatio: '0.01534238007778448775',
          supplyUsageRatio: '0.01534238007778448775',
          formattedReserveLiquidationBonus: '0.075',
          formattedEModeLiquidationBonus: '0.01',
          formattedEModeLiquidationThreshold: '0.95',
          formattedEModeLtv: '0.93',
          supplyAPY: '0.00003112395906657383',
          variableBorrowAPY: '0.00238943754103481217',
          stableBorrowAPY: '0.07250818117089440143',
          formattedAvailableLiquidity: '2314.651612891643030158',
          unborrowedLiquidity: '2314.651612891643030158',
          formattedBaseLTVasCollateral: '0.745',
          supplyAPR: '0.0000311234747262249',
          variableBorrowAPR: '0.00238658737453766736',
          stableBorrowAPR: '0.07',
          formattedReserveLiquidationThreshold: '0.77',
          debtCeilingUSD: '0',
          isolationModeTotalDebtUSD: '0',
          availableDebtCeilingUSD: '0',
          isIsolated: false,
          totalLiquidityUSD: '8292529.48772619809145027124',
          availableLiquidityUSD: '1001623.84509386917457247047',
          totalDebtUSD: '127227.13920693082542400187',
          totalVariableDebtUSD: '127227.13920693082542400187',
          totalStableDebtUSD: '0',
          formattedPriceInMarketReferenceCurrency: '3527.65932594',
          priceInUSD: '3527.65932594',
          borrowCapUSD: '1128850.9843008',
          supplyCapUSD: '11288509.843008',
          unbackedUSD: '0',
          aIncentivesData: [
            {
              incentiveAPR: '0.02478541814898917815',
              rewardTokenAddress: '0x30D20208d987713f46DFD34EF128Bb16C404D10f',
              rewardTokenSymbol: 'SD',
            },
          ],
          vIncentivesData: [],
          sIncentivesData: [],
          iconSymbol: 'ETHX',
          isEmodeEnabled: true,
          isWrappedBaseAsset: false,
          reserve: {
            decimals: Number(item.decimals),
            baseLTVasCollateral: '7450',
            reserveLiquidationThreshold: '7700',
            reserveLiquidationBonus: '10750',
            usageAsCollateralEnabled: true,
            borrowingEnabled: true,
            stableBorrowRateEnabled: false,
            liquidityRate: '31123474726224900471975',
            variableBorrowRate: '2386587374537667364806198',
            stableBorrowRate: '70000000000000000000000000',
            aTokenAddress: '0x1c0E06a0b1A4c160c17545FF2A951bfcA57C0002',
            stableDebtTokenAddress: '0xBDfa7DE5CF7a7DdE4F023Cac842BF520fcF5395C',
            variableDebtTokenAddress: '0x08a8Dc81AeA67F84745623aC6c72CDA3967aab8b',
            interestRateStrategyAddress: '0x48AF11111764E710fcDcE2750db848C63edab57B',
            availableLiquidity: '2314651612891643030158',
            totalPrincipalStableDebt: '0',
            averageStableRate: '0',
            stableDebtLastUpdateTimestamp: 0,
            totalScaledVariableDebt: '36.053394800123496879',
            priceInMarketReferenceCurrency: '352765932594',
            priceOracle: '0xD6270dAabFe4862306190298C2B48fed9e15C847',
            variableRateSlope1: '70000000000000000000000000',
            variableRateSlope2: '3000000000000000000000000000',
            stableRateSlope1: '0',
            stableRateSlope2: '0',
            baseStableBorrowRate: '70000000000000000000000000',
            baseVariableBorrowRate: '0',
            optimalUsageRatio: '450000000000000000000000000',
            eModeCategoryId: 1,
            borrowCap: '320',
            eModeLtv: 9300,
            eModeLiquidationThreshold: 9500,
            eModeLiquidationBonus: 10100,
            eModePriceSource: '0x0000000000000000000000000000000000000000',
            eModeLabel: 'ETH correlated',
            borrowableInIsolation: false,
            unbacked: '0',
            isolationModeTotalDebt: '0',
            debtCeilingDecimals: 2,
            isSiloedBorrowing: false,
            flashLoanEnabled: true,
            totalDebt: '36.065596887825658831',
            totalStableDebt: '0',
            totalVariableDebt: '36.065596887825658831',
            totalLiquidity: '2350.717209779468688989',
            borrowUsageRatio: '0.01534238007778448775',
            supplyUsageRatio: '0.01534238007778448775',
            formattedReserveLiquidationBonus: '0.075',
            formattedEModeLiquidationBonus: '0.01',
            formattedEModeLiquidationThreshold: '0.95',
            formattedEModeLtv: '0.93',
            supplyAPY: '0.00003112395906657383',
            variableBorrowAPY: '0.00238943754103481217',
            stableBorrowAPY: '0.07250818117089440143',
            formattedAvailableLiquidity: '2314.651612891643030158',
            unborrowedLiquidity: '2314.651612891643030158',
            formattedBaseLTVasCollateral: '0.745',
            supplyAPR: '0.0000311234747262249',
            variableBorrowAPR: '0.00238658737453766736',
            stableBorrowAPR: '0.07',
            formattedReserveLiquidationThreshold: '0.77',
            debtCeilingUSD: '0',
            isolationModeTotalDebtUSD: '0',
            availableDebtCeilingUSD: '0',
            isIsolated: false,
            totalLiquidityUSD: '8292529.48772619809145027124',
            availableLiquidityUSD: '1001623.84509386917457247047',
            totalDebtUSD: '127227.13920693082542400187',
            totalVariableDebtUSD: '127227.13920693082542400187',
            totalStableDebtUSD: '0',
            formattedPriceInMarketReferenceCurrency: '3527.65932594',
            priceInUSD: '3527.65932594',
            borrowCapUSD: '1128850.9843008',
            supplyCapUSD: '11288509.843008',
            unbackedUSD: '0',
            aIncentivesData: [
              {
                incentiveAPR: '0.02478541814898917815',
                rewardTokenAddress: '0x30D20208d987713f46DFD34EF128Bb16C404D10f',
                rewardTokenSymbol: 'SD',
              },
            ],
            vIncentivesData: [],
            sIncentivesData: [],
            iconSymbol: 'ETHX',
            isEmodeEnabled: true,
            isWrappedBaseAsset: false,
            id: `10-${item.underlyingAsset
              .toString()
              .toLocaleLowerCase()}-0x2f39d218133afab8f2b819b1066c7e434ad94e9e`,
            underlyingAsset: item.underlyingAsset.toString().toLocaleLowerCase(),
            name: item.name || 'Fake coin',
            symbol: item.symbol || 'Fake coin',
            reserveFactor: item.reserveFactor.toString(),
            isPaused: item.isPaused,
            debtCeiling: item.debtCeiling.toString(),
            supplyCap: item.supplyCap.toString(),
            isActive: item.isActive,
            isFrozen: item.isFrozen,
            liquidityIndex: item.liquidityIndex.toString(),
            variableBorrowIndex: item.variableBorrowIndex.toString(),
            lastUpdateTimestamp: Number(item.lastUpdateTimestamp.toString()),
            accruedToTreasury: item.accruedToTreasury.toString(),
          },

          availableToDeposit: '0',
          availableToDepositUSD: '0',
          usageAsCollateralEnabledOnUser: true,

          detailsAddress: item.underlyingAsset.toString().toLocaleLowerCase(),
          name: item.name || 'Fake coin',
          symbol: item.symbol || 'Fake coin',
          decimals: Number(item.decimals),
          variableBorrowIndex: item.variableBorrowIndex.toString(),
          walletBalance: walletBalance?.toString() || '0',
          walletBalanceUSD: walletBalance?.toString() || '0',
          isActive: item.isActive,
          isFrozen: item.isFrozen,
          isPaused: item.isPaused,
          debtCeiling: item.debtCeiling.toString(),
          accruedToTreasury: item.accruedToTreasury.toString(),

          //
          LTV: item.LTV.toString(),
          borrowCap: item.borrowCap.toString(),
          currentLiquidityRate: item.currentLiquidityRate.toString(),
          lastUpdateTimestamp: Number(item.lastUpdateTimestamp.toString()),
          liquidityIndex: item.liquidityIndex.toString(),
          reserveFactor: item.reserveFactor.toString(),
          supplyCap: item.supplyCap.toString(),
          underlyingAsset: item.underlyingAsset.toString().toLocaleLowerCase(),
          id: `10-${item.underlyingAsset
            .toString()
            .toLocaleLowerCase()}-0x2f39d218133afab8f2b819b1066c7e434ad94e9e`,
          image: item.image || '',
          underlyingAssetTon: item.underlyingAsset.toString(),
          currentStableBorrowRate: item.currentStableBorrowRate.toString(),
          currentVariableBorrowRate: item.currentVariableBorrowRate.toString(),
          description: item.description,
          isBorrowingEnabled: item.isBorrowingEnabled,
          rateStrategyAddress: item.rateStrategyAddress.toString(),
          stableBorrowIndex: item.stableBorrowIndex.toString(),
          totalStableBorrow: item.totalStableBorrow.toString(),
          totalSupply: item.totalSupply.toString(),
          totalVariableBorrow: item.totalVariableBorrow.toString(),
          // id: item.underlyingAsset.toString(),
        };
      })
    );
    const mergedArray = JSON.parse(JSON.stringify([...arr, ...dataAssumeReserves]));
    setReservesTon(mergedArray as DashboardReserve[]);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, poolContract, walletAddressTonWallet]);

  useEffect(() => {
    getValueReserve();
  }, [client, getValueReserve, poolContract, walletAddressTonWallet]);

  const symbolTon = 'ETHx';

  return {
    symbolTon,
    reservesTon,
    userTon,
    listPoolContract,
    address: 'counterContract?.address.toString()',
    loading,
    getValueReserve,
    setReservesTon,
  };
}
