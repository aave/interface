import {
  calculateCompoundedRate,
  LTV_PRECISION,
  normalize,
  RAY_DECIMALS,
  SECONDS_PER_YEAR,
  valueToBigNumber,
} from '@aave/math-utils';
import userTon from '@public/assume-user.json';
import { Address, Cell, ContractProvider, OpenedContract, Sender } from '@ton/core';
import { formatUnits } from 'ethers/lib/utils';
import { useCallback, useEffect, useState } from 'react';
import { JettonMinter } from 'src/contracts/JettonMinter';
import { Pool } from 'src/contracts/Pool';
import { useContract } from 'src/hooks/useContract';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';

import { useTonClient } from '../useTonClient';
import { WalletBalanceUSD } from './useSocketGetRateUSD';
import { useTonBalance } from './useWalletBalances';
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

export interface PoolContractReservesDataType {
  LTV: number;
  accruedToTreasury: bigint | 0;
  averageStableBorrowRate: bigint | 0;
  symbol?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  image?: string | undefined;
  image_data?: string | undefined;
  decimals: string | number;
  reserveID: string;
  borrowCap: bigint | string | 0 | number;
  currentLiquidityRate: bigint | string | 0 | number;
  currentStableBorrowRate: bigint | string | 0 | number;
  currentVariableBorrowRate: bigint | string | 0 | number;
  debtCeiling: bigint | string | 0 | number;
  isActive: boolean;
  isBorrowingEnabled: boolean;
  isFrozen: boolean;
  isJetton: boolean;
  isPaused: boolean;
  lastUpdateTimestamp: bigint | string | 0 | number;
  liquidationThreshold: bigint | string | 0 | number;
  liquidityIndex: bigint | string | 0 | number;
  reserveFactor: bigint | string | 0 | number;
  stableBorrowIndex: bigint | string | 0 | number;
  supplyCap: bigint | string | 0 | number;
  totalStableDebt: bigint | string | 0 | number;
  totalSupply: bigint | string | 0 | number;
  totalVariableDebt: bigint | string | 0 | number;
  underlyingAddress: Address;
  variableBorrowIndex: bigint | 0;
}

export const address_pools = 'EQDb9JsZ1QOwszqEzpJmnMJAAXukXzchlrV6Q08nJ83oVjbw';
export const MAX_ATTEMPTS = 10;
export const GAS_FEE_TON = 0.3;

export const useAppDataProviderTon = (ExchangeRateListUSD: WalletBalanceUSD[]) => {
  const client = useTonClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [reservesTon, setReservesTon] = useState<DashboardReserve[]>([]);
  const [gasFeeTonMarketReferenceCurrency, setGasFeeTonMarketReferenceCurrency] = useState<
    number | string
  >('0');
  const [poolContractReservesData, setPoolContractReservesData] = useState<
    PoolContractReservesDataType[]
  >([]);
  const poolContract = useContract<Pool>(address_pools, Pool);
  const { onGetBalanceTonNetwork } = useGetBalanceTon();
  const { walletAddressTonWallet } = useTonConnectContext();
  const { balance: yourWalletBalanceTon, refetch: fetchBalanceTon } =
    useTonBalance(walletAddressTonWallet);

  const getPoolJettonWalletAddress = useCallback(
    async (address: string) => {
      if (!client || !address_pools || !address) return null;
      const contractJettonMinter = new JettonMinter(Address.parse(address));
      const providerJettonMinter = client.open(
        contractJettonMinter
      ) as OpenedContract<JettonMinter>;
      const poolJetton = await providerJettonMinter.getWalletAddress(Address.parse(address_pools));
      return poolJetton;
    },
    [client]
  );

  const getPoolContractGetReservesData = useCallback(async () => {
    let attempts = 0;
    const maxAttempts = MAX_ATTEMPTS;
    setLoading(true);

    const fetchData = async () => {
      try {
        attempts++;
        if (!poolContract || !client || !walletAddressTonWallet) return;
        const reserves = await poolContract.getReservesData();
        setPoolContractReservesData(reserves);
      } catch (error) {
        console.error(
          `Error fetching getPoolContractGetReservesData (attempt ${attempts}):`,
          error
        );
        if (attempts < maxAttempts) {
          console.log('Retrying...getPoolContractGetReservesData');
          await fetchData();
        } else {
          console.log('Max attempts reached, stopping retries.');
          setPoolContractReservesData([]);
        }
      } finally {
        if (
          attempts >= maxAttempts ||
          (attempts < maxAttempts && poolContractReservesData.length > 0)
        ) {
          setLoading(false);
        }
      }
    };

    await fetchData();
  }, [client, poolContract, poolContractReservesData.length, walletAddressTonWallet]);

  useEffect(() => {
    getPoolContractGetReservesData();
  }, [client, poolContract, walletAddressTonWallet, getPoolContractGetReservesData]);

  const getValueReserve = useCallback(async () => {
    let attempts = 0;
    const maxAttempts = MAX_ATTEMPTS;
    setLoading(true);
    const fetchData = async () => {
      try {
        attempts++;
        if (!poolContract || !client || !walletAddressTonWallet) return;
        await fetchBalanceTon();
        const arr = await Promise.all(
          poolContractReservesData.map(async (item) => {
            const balance =
              item?.isJetton && (await onGetBalanceTonNetwork(item.underlyingAddress.toString()));

            const walletBalance = item?.isJetton
              ? formatUnits(balance || '0', item.decimals)
              : yourWalletBalanceTon;

            const poolJettonWalletAddress = item.isJetton
              ? await getPoolJettonWalletAddress(item.underlyingAddress.toString())
              : item.underlyingAddress;

            const liquidityRate = item.currentLiquidityRate.toString().substring(0, RAY_DECIMALS); // cut from 0 to 27 index

            const supplyAPR = normalize(liquidityRate, RAY_DECIMALS);

            const supplyAPY = calculateCompoundedRate({
              rate: liquidityRate,
              duration: SECONDS_PER_YEAR,
            });

            const variableBorrowAPY = calculateCompoundedRate({
              rate: item.currentVariableBorrowRate.toString().toString().substring(0, RAY_DECIMALS), // cut from 0 to 27 index
              duration: SECONDS_PER_YEAR,
            });

            const stableBorrowRate = item.currentStableBorrowRate
              .toString()
              .substring(0, RAY_DECIMALS); // cut from 0 to 27 index

            const stableBorrowAPY = calculateCompoundedRate({
              rate: stableBorrowRate,
              duration: SECONDS_PER_YEAR,
            });

            const stableBorrows = 0;

            const reserveLiquidationThreshold = item.liquidationThreshold.toString();

            const formattedReserveLiquidationThreshold = normalize(
              reserveLiquidationThreshold,
              LTV_PRECISION
            );

            const baseLTVasCollateral = item.LTV.toString();

            const formattedBaseLTVasCollateral = normalize(baseLTVasCollateral, LTV_PRECISION);

            const totalBorrowed = valueToBigNumber(item.totalVariableDebt.toString()).plus(
              item.totalStableDebt.toString()
            );

            const totalLiquidity = item.totalSupply.toString();

            const availableLiquidity = valueToBigNumber(totalLiquidity).minus(totalBorrowed);

            const utilizationRate = valueToBigNumber(totalBorrowed).div(totalLiquidity);

            return {
              // ...item,
              baseLTVasCollateral: baseLTVasCollateral,
              reserveLiquidationThreshold: reserveLiquidationThreshold,
              reserveLiquidationBonus: '10750',
              usageAsCollateralEnabled: true,
              borrowingEnabled: true,
              stableBorrowRateEnabled: false,
              liquidityRate: liquidityRate,
              variableBorrowRate: '1111',
              stableBorrowRate: stableBorrowRate,
              aTokenAddress: '0x1c0E06a0b1A4c160c17545FF2A951bfcA57C0002',
              stableDebtTokenAddress: '0xBDfa7DE5CF7a7DdE4F023Cac842BF520fcF5395C',
              variableDebtTokenAddress: '0x08a8Dc81AeA67F84745623aC6c72CDA3967aab8b',
              interestRateStrategyAddress: '0x48AF11111764E710fcDcE2750db848C63edab57B',
              availableLiquidity: availableLiquidity,
              totalPrincipalStableDebt: '0',
              averageStableRate: '0',
              stableDebtLastUpdateTimestamp: 0,
              totalScaledVariableDebt: '36.053394800123496879',
              priceInMarketReferenceCurrency: '352765932594',
              priceOracle: '0xD6270dAabFe4862306190298C2B48fed9e15C847',
              variableRateSlope1: stableBorrowRate,
              variableRateSlope2: '3000000000000000000000000000',
              stableRateSlope1: '0',
              stableRateSlope2: '0',
              baseStableBorrowRate: stableBorrowRate,
              baseVariableBorrowRate: '0',
              optimalUsageRatio: '450000000000000000000000000',
              eModeCategoryId: 0,
              eModeLtv: baseLTVasCollateral,
              eModeLiquidationThreshold: reserveLiquidationThreshold,
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
              totalLiquidity: formatUnits(totalLiquidity || '0', item.decimals),
              borrowUsageRatio: utilizationRate,
              supplyUsageRatio: utilizationRate,
              formattedReserveLiquidationBonus: '0.075',
              formattedEModeLiquidationBonus: '0.01',
              formattedEModeLiquidationThreshold: '0.95',
              formattedEModeLtv: '0',
              formattedAvailableLiquidity: normalize(availableLiquidity, Number(item.decimals)),
              unborrowedLiquidity: '2314.651612891643030158',
              formattedBaseLTVasCollateral: formattedBaseLTVasCollateral,
              supplyAPR: supplyAPR,
              variableBorrowAPR: '0.00238658737453766736',
              formattedReserveLiquidationThreshold: formattedReserveLiquidationThreshold,
              debtCeilingUSD: '0',
              isolationModeTotalDebtUSD: '0',
              availableDebtCeilingUSD: '0',
              isIsolated: false,
              totalDebtUSD: '127227.13920693082542400187',
              totalVariableDebtUSD: '127227.13920693082542400187',
              totalStableDebtUSD: '0',
              borrowCapUSD: '1128850.9843008',
              unbackedUSD: '0',
              aIncentivesData: [
                {
                  incentiveAPR: '0',
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
                reserveLiquidationThreshold: reserveLiquidationThreshold,
                reserveLiquidationBonus: '10750',
                usageAsCollateralEnabled: true,
                borrowingEnabled: true,
                stableBorrowRateEnabled: false,
                liquidityRate: liquidityRate,
                variableBorrowRate: '1111',
                stableBorrowRate: stableBorrowRate,
                aTokenAddress: '0x1c0E06a0b1A4c160c17545FF2A951bfcA57C0002',
                stableDebtTokenAddress: '0xBDfa7DE5CF7a7DdE4F023Cac842BF520fcF5395C',
                variableDebtTokenAddress: '0x08a8Dc81AeA67F84745623aC6c72CDA3967aab8b',
                interestRateStrategyAddress: '0x48AF11111764E710fcDcE2750db848C63edab57B',
                availableLiquidity: availableLiquidity,
                totalPrincipalStableDebt: '0',
                averageStableRate: '0',
                stableDebtLastUpdateTimestamp: 0,
                totalScaledVariableDebt: '36.053394800123496879',
                priceInMarketReferenceCurrency: '352765932594',
                priceOracle: '0xD6270dAabFe4862306190298C2B48fed9e15C847',
                variableRateSlope1: stableBorrowRate,
                variableRateSlope2: '3000000000000000000000000000',
                stableRateSlope1: '0',
                stableRateSlope2: '0',
                baseStableBorrowRate: stableBorrowRate,
                baseVariableBorrowRate: '0',
                optimalUsageRatio: '450000000000000000000000000',
                eModeCategoryId: 0,
                eModeLtv: baseLTVasCollateral,
                eModeLiquidationThreshold: reserveLiquidationThreshold,
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
                totalLiquidity: formatUnits(totalLiquidity || '0', item.decimals),
                borrowUsageRatio: utilizationRate,
                supplyUsageRatio: utilizationRate,
                formattedReserveLiquidationBonus: '0.075',
                formattedEModeLiquidationBonus: '0.01',
                formattedEModeLiquidationThreshold: '0.95',
                formattedEModeLtv: '0',
                supplyAPY: normalize(supplyAPY, RAY_DECIMALS),
                variableBorrowAPY: normalize(variableBorrowAPY, RAY_DECIMALS),
                stableBorrowAPY: normalize(stableBorrowAPY, RAY_DECIMALS),
                formattedAvailableLiquidity: normalize(availableLiquidity, Number(item.decimals)),
                unborrowedLiquidity: '2314.651612891643030158',
                formattedBaseLTVasCollateral: formattedBaseLTVasCollateral,
                supplyAPR: supplyAPR,
                variableBorrowAPR: '0.00238658737453766736',
                stableBorrowAPR: '0.07',
                formattedReserveLiquidationThreshold: formattedReserveLiquidationThreshold,
                debtCeilingUSD: '0',
                isolationModeTotalDebtUSD: '0',
                availableDebtCeilingUSD: '0',
                isIsolated: false,
                totalDebtUSD: '127227.13920693082542400187',
                totalVariableDebtUSD: '127227.13920693082542400187',
                totalStableDebtUSD: '0',
                unbackedUSD: '0',
                aIncentivesData: [
                  {
                    incentiveAPR: '0',
                    rewardTokenAddress: '0x30D20208d987713f46DFD34EF128Bb16C404D10f',
                    rewardTokenSymbol: 'SD',
                  },
                ],
                vIncentivesData: [],
                sIncentivesData: [],
                iconSymbol: 'ETHX',
                isEmodeEnabled: true,
                isWrappedBaseAsset: false,
                id: `10-${item.underlyingAddress
                  .toString()
                  .toLocaleLowerCase()}-0x2f39d218133afab8f2b819b1066c7e434ad94e9e`,
                underlyingAsset: item.underlyingAddress.toString().toLocaleLowerCase(),
                name: item.name || 'Fake coin',
                symbol: item.symbol || 'Fake coin',
                reserveFactor: item.reserveFactor.toString(),
                isPaused: item.isPaused,
                debtCeiling: item.debtCeiling.toString(),
                borrowCap: formatUnits(item.borrowCap || '0', item.decimals),
                supplyCap: formatUnits(item.supplyCap || '0', item.decimals),
                isActive: item.isActive,
                isFrozen: item.isFrozen,
                liquidityIndex: item.liquidityIndex.toString(),
                variableBorrowIndex: item.variableBorrowIndex.toString(),
                lastUpdateTimestamp: Number(item.lastUpdateTimestamp.toString()),
                accruedToTreasury: item.accruedToTreasury.toString(),
                totalVariableDebt: formatUnits(item.totalVariableDebt || '0', item.decimals),
                totalStableDebt: formatUnits(item.totalStableDebt || '0', item.decimals),
              },

              availableToDeposit: '0',
              availableToDepositUSD: '0',
              usageAsCollateralEnabledOnUser: true,

              totalVariableDebt: formatUnits(item.totalVariableDebt || '0', item.decimals),
              detailsAddress: item.underlyingAddress.toString().toLocaleLowerCase(),
              name: item.name || 'Fake coin',
              symbol: item.symbol || 'Fake coin',
              decimals: Number(item.decimals),
              variableBorrowIndex: item.variableBorrowIndex.toString(),
              walletBalance: walletBalance?.toString() || '0',
              isActive: item.isActive,
              isFrozen: item.isFrozen,
              isPaused: item.isPaused,
              debtCeiling: item.debtCeiling.toString(),
              accruedToTreasury: item.accruedToTreasury.toString(),
              totalStableDebt: formatUnits(item.totalStableDebt || '0', item.decimals),

              //
              currentLiquidityRate: item.currentLiquidityRate.toString(),
              lastUpdateTimestamp: Number(item.lastUpdateTimestamp.toString()),
              liquidityIndex: item.liquidityIndex.toString(),
              reserveFactor: item.reserveFactor.toString(),
              borrowCap: formatUnits(item.borrowCap || '0', item.decimals),
              supplyCap: formatUnits(item.supplyCap || '0', item.decimals),
              underlyingAsset: item.underlyingAddress.toString().toLocaleLowerCase(),
              id: `10-${item.underlyingAddress
                .toString()
                .toLocaleLowerCase()}-0x2f39d218133afab8f2b819b1066c7e434ad94e9e`,
              image: item.image || '',
              underlyingAssetTon: item.underlyingAddress.toString(),
              currentStableBorrowRate: item.currentStableBorrowRate.toString(),
              currentVariableBorrowRate: item.currentVariableBorrowRate.toString(),
              description: item.description,
              isBorrowingEnabled: item.isBorrowingEnabled,
              stableBorrowIndex: item.stableBorrowIndex.toString(),
              averageStableBorrowRate: item.averageStableBorrowRate.toString(),
              isJetton: item.isJetton,
              poolJettonWalletAddress: poolJettonWalletAddress?.toString(),
              stableBorrows: stableBorrows.toString(),
              stableBorrowsMarketReferenceCurrency: '0',
              stableBorrowsUSD: '0',
              variableBorrowsMarketReferenceCurrency: '0',
              totalBorrows: '0',
              totalBorrowsMarketReferenceCurrency: '0',
              totalBorrowsUSD: '0',
              supplyAPY: normalize(supplyAPY, RAY_DECIMALS),
              stableBorrowAPR: '0.07',
              stableBorrowAPY: normalize(stableBorrowAPY, RAY_DECIMALS),
              variableBorrowAPY: normalize(variableBorrowAPY, RAY_DECIMALS),
              borrowRateMode: 'Variable',
            };
          })
        );

        const mergedArray = JSON.parse(JSON.stringify([...arr]));

        console.log('Assets to supply-----------', mergedArray);

        setReservesTon(mergedArray as DashboardReserve[]);
      } catch (error) {
        console.error(`Error fetching getValueReserve (attempt ${attempts}):`, error);
        if (attempts < maxAttempts) {
          console.log('Retrying...getValueReserve');
          await fetchData();
        } else {
          console.log('Max attempts reached, stopping retries.');
          setReservesTon([]);
        }
      } finally {
        if (
          attempts >= maxAttempts ||
          (attempts < maxAttempts && poolContractReservesData.length > 0)
        ) {
          setLoading(false);
        }
      }
    };

    await fetchData();
  }, [
    client,
    fetchBalanceTon,
    getPoolJettonWalletAddress,
    onGetBalanceTonNetwork,
    poolContract,
    poolContractReservesData,
    walletAddressTonWallet,
    yourWalletBalanceTon,
  ]);

  useEffect(() => {
    getValueReserve();
  }, [
    client,
    getValueReserve,
    poolContract,
    walletAddressTonWallet,
    yourWalletBalanceTon,
    poolContractReservesData,
  ]);

  useEffect(() => {
    const newReserves = reservesTon.map((reserve) => {
      const dataById = ExchangeRateListUSD?.find(
        (subItem) => subItem.address === reserve.underlyingAssetTon
      );

      const numberFormateUSD = Number(dataById?.usd || 0)
        .toFixed(0)
        .toString();

      const priceInUSD = Number(formatUnits(numberFormateUSD, dataById?.decimal)).toString();

      const walletBalanceUSD = valueToBigNumber(priceInUSD)
        .multipliedBy(reserve.walletBalance || 0)
        .toString();

      const totalLiquidityUSD = valueToBigNumber(priceInUSD)
        .multipliedBy(reserve.totalLiquidity || 0)
        .toString();

      const availableLiquidityUSD = valueToBigNumber(priceInUSD)
        .multipliedBy(reserve.formattedAvailableLiquidity || 0)
        .toString();

      const borrowCapUSD = valueToBigNumber(priceInUSD)
        .multipliedBy(reserve.borrowCap || 0)
        .toString();
      const supplyCapUSD = valueToBigNumber(priceInUSD)
        .multipliedBy(reserve.supplyCap || 0)
        .toString();

      if (dataById?.address === address_pools) {
        setGasFeeTonMarketReferenceCurrency(
          valueToBigNumber(priceInUSD)
            .multipliedBy(GAS_FEE_TON || 0)
            .toString()
        );
      }

      return {
        ...reserve,
        walletBalanceUSD,
        priceInUSD,
        formattedPriceInMarketReferenceCurrency: priceInUSD,
        totalLiquidityUSD,
        availableLiquidityUSD,
        borrowCapUSD,
        supplyCapUSD,
        reserve: {
          ...reserve.reserve,
          walletBalanceUSD,
          priceInUSD,
          formattedPriceInMarketReferenceCurrency: priceInUSD,
          totalLiquidityUSD,
          availableLiquidityUSD,
          borrowCapUSD,
          supplyCapUSD,
        },
      };
    });

    if (JSON.stringify(newReserves) !== JSON.stringify(reservesTon)) {
      console.log('Assets to supply---------------', newReserves);
      setReservesTon(newReserves);
    }
  }, [reservesTon, ExchangeRateListUSD]);

  const symbolTon = 'ETHx';

  return {
    symbolTon,
    reservesTon,
    userTon,
    address: 'counterContract?.address.toString()',
    loading,
    getValueReserve,
    getPoolContractGetReservesData,
    setReservesTon,
    yourWalletBalanceTon,
    gasFeeTonMarketReferenceCurrency,
  };
};
