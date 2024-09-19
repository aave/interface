import {
  BigNumberValue,
  calculateCompoundedRate,
  LTV_PRECISION,
  normalize,
  RAY_DECIMALS,
  SECONDS_PER_YEAR,
  valueToBigNumber,
} from '@aave/math-utils';
import userTon from '@public/assume-user.json';
import { Address, Cell, ContractProvider, Sender } from '@ton/core';
import dayjs from 'dayjs';
import { formatUnits } from 'ethers/lib/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pool } from 'src/contracts/Pool';
import { useContract } from 'src/hooks/useContract';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { useRootStore } from 'src/store/root';
import { calculateReserveDebt } from 'src/utils/calculate-reserve-debt';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { sleep } from 'src/utils/rotationProvider';

import { useTonClient } from '../useTonClient';
import { WalletBalanceUSD } from './useSocketGetRateUSD';
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
  averageStableBorrowRate: bigint | 0;
  borrowCap: bigint | string | 0 | number;
  currentLiquidityRate: bigint | string | 0 | number;
  currentStableBorrowRate: bigint | string | 0 | number;
  currentVariableBorrowRate: bigint | string | 0 | number;
  debtCeiling: bigint | string | 0 | number;
  decimals: string | number;
  description?: string | undefined;
  image?: string | undefined;
  isActive: boolean;
  isBorrowingEnabled: boolean;
  isFrozen: boolean;
  isJetton: boolean;
  isPaused: boolean;
  lastUpdateTimestamp: bigint | string | 0 | number;
  liquidationThreshold: bigint | string | 0 | number;
  liquidity: bigint | string | 0 | number;
  liquidityIndex: bigint | string | 0 | number;
  name?: string | undefined;
  poolJWAddress: Address;
  reserveFactor: bigint | string | 0 | number;
  reserveID: bigint | string;
  supplyCap: bigint | string | 0 | number;
  symbol?: string | undefined;
  totalStableDebt: bigint | string | 0 | number;
  totalSupply: bigint | string | 0 | number;
  totalVariableDebt: bigint | string | 0 | number;
  underlyingAddress: Address;
  variableBorrowIndex: bigint | 0;

  // accruedToTreasury: bigint | 0;
  // image_data?: string | undefined;
  // stableBorrowIndex: bigint | string | 0 | number;
}

export const address_pools = 'EQD0Gt-PYwQX_Ee0xmcc_tS4nJX2ieC7cLop41bkUQqt35Y7';
export const MAX_ATTEMPTS = 10;
export const GAS_FEE_TON = 0.3;
export const API_TON_V2 = 'https://testnet.toncenter.com/api/v2';
export const API_TON_V3 = 'https://testnet.toncenter.com/api/v3';
export const API_TON_SCAN_V2 = 'https://testnet.tonapi.io/v2';
export const SCAN_TRANSACTION_TON = 'https://testnet.tonviewer.com';
export const URL_API_BE = 'https://aave-ton-api.sotatek.works';

export const useAppDataProviderTon = (ExchangeRateListUSD: WalletBalanceUSD[]) => {
  const [setAccount] = useRootStore((store) => [store.setAccount, store.currentChainId]);
  const client = useTonClient();
  const [loading, setLoading] = useState<boolean>(true);
  const [reservesTon, setReservesTon] = useState<DashboardReserve[]>([]);
  const [gasFeeTonMarketReferenceCurrency, setGasFeeTonMarketReferenceCurrency] = useState<
    number | string
  >('0');
  const [poolContractReservesData, setPoolContractReservesData] = useState<
    PoolContractReservesDataType[]
  >([]);
  const poolContract = useContract<Pool>(address_pools, Pool);
  const { isConnectedTonWallet, walletAddressTonWallet } = useTonConnectContext();
  const { onGetBalanceTonNetwork, yourWalletBalanceTon, loadingTokenTon, refetchBalanceTokenTon } =
    useGetBalanceTon(isConnectedTonWallet);

  useMemo(() => {
    if (isConnectedTonWallet) {
      setAccount(walletAddressTonWallet);
    } else {
      setAccount('');
    }
  }, [isConnectedTonWallet, setAccount, walletAddressTonWallet]);

  const getPoolContractGetReservesData = useCallback(
    async (pauseReload?: boolean) => {
      let attempts = 0;
      const maxAttempts = MAX_ATTEMPTS;

      if (!isConnectedTonWallet) {
        setLoading(false);
        setPoolContractReservesData([]);
      }
      const fetchData = async () => {
        try {
          attempts++;
          if (!poolContract || !client || !walletAddressTonWallet) return;
          await refetchBalanceTokenTon(pauseReload);
          const reserves = await poolContract.getReservesData();
          setPoolContractReservesData(reserves as PoolContractReservesDataType[]);
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
            return;
          }
        }
      };

      await fetchData();
    },
    [
      client,
      isConnectedTonWallet,
      poolContract,
      poolContractReservesData.length,
      refetchBalanceTokenTon,
      walletAddressTonWallet,
    ]
  );

  useEffect(() => {
    setLoading(true);
    getPoolContractGetReservesData();
  }, [client, poolContract, walletAddressTonWallet, getPoolContractGetReservesData]);

  const getValueReserve = useCallback(async () => {
    let attempts = 0;
    const maxAttempts = MAX_ATTEMPTS;
    // const currentTimestampClone = JSON.parse(JSON.stringify(currentTimestamp));

    const fetchData = async () => {
      try {
        attempts++;
        if (!poolContract || !client || !walletAddressTonWallet) return;
        const arr = await Promise.all(
          poolContractReservesData.map(async (item) => {
            const normalizeWithReserve = (n: BigNumberValue) => normalize(n, Number(item.decimals));
            // const isIsolated = item.debtCeiling.toString() !== '0'; // todo
            const isIsolated = false;
            const walletBalance = !item?.isJetton
              ? '0'
              : await onGetBalanceTonNetwork(item.underlyingAddress.toString(), item.decimals);

            const stableBorrows = 0;
            const unbacked = 0;
            const poolJettonWalletAddress = item.poolJWAddress.toString();
            const borrowCap = formatUnits(item.borrowCap || '0', item.decimals);
            const supplyCap = formatUnits(item.supplyCap || '0', item.decimals);
            const liquidity = item.liquidity.toString().substring(0, RAY_DECIMALS); // cut from 0 to 27 index
            const availableLiquidity = valueToBigNumber(liquidity); // SC confirm = liquidity --> remove .minus(totalBorrowed)
            const liquidityRate = item.currentLiquidityRate.toString().substring(0, RAY_DECIMALS); // cut from 0 to 27 index

            const supplyAPYCalculate = calculateCompoundedRate({
              rate: liquidityRate,
              duration: SECONDS_PER_YEAR,
            });

            const variableBorrowRate = item.currentVariableBorrowRate
              .toString()
              .substring(0, RAY_DECIMALS); // cut from 0 to 27 index

            const variableBorrowAPYCalculate = calculateCompoundedRate({
              rate: variableBorrowRate,
              duration: SECONDS_PER_YEAR,
            });

            const stableBorrowRate = item.currentStableBorrowRate
              .toString()
              .substring(0, RAY_DECIMALS); // cut from 0 to 27 index

            const variableBorrowRateCalculate = calculateCompoundedRate({
              rate: stableBorrowRate,
              duration: SECONDS_PER_YEAR,
            });

            const reserveLiquidationThreshold = item.liquidationThreshold.toString();

            const baseLTVasCollateral = item.LTV.toString();

            const lastUpdateTimestamp = Number(item.lastUpdateTimestamp.toString());

            const variableBorrowIndex = item.variableBorrowIndex.toString();

            const {
              totalDebt: totalDebtCalculate,
              totalStableDebt: totalStableDebtCalculate,
              totalVariableDebt: totalVariableDebtCalculate,
              totalLiquidity: totalLiquidityCalculate,
            } = calculateReserveDebt(
              {
                totalScaledVariableDebt: item.totalVariableDebt.toString(),
                variableBorrowIndex: variableBorrowIndex,
                totalPrincipalStableDebt: '0',
                availableLiquidity: liquidity,
                variableBorrowRate: variableBorrowRate,
                lastUpdateTimestamp,
                averageStableRate: '0',
                stableDebtLastUpdateTimestamp: 0,
                virtualUnderlyingBalance: '0',
              },
              dayjs().unix()
              // currentTimestampClone
            );

            const totalVariableDebt = normalizeWithReserve(totalVariableDebtCalculate);
            const totalStableDebt = normalizeWithReserve(totalStableDebtCalculate);
            const totalLiquidity = normalizeWithReserve(totalLiquidityCalculate);
            const formattedAvailableLiquidity = normalizeWithReserve(availableLiquidity);
            const unborrowedLiquidity = normalizeWithReserve(availableLiquidity);
            const totalDebt = totalDebtCalculate;
            const borrowUsageRatio = totalLiquidityCalculate.eq(0)
              ? '0'
              : valueToBigNumber(totalDebt).dividedBy(totalLiquidityCalculate).toFixed();
            const supplyUsageRatio = totalLiquidityCalculate.eq(0)
              ? '0'
              : valueToBigNumber(totalDebt)
                  .dividedBy(totalLiquidityCalculate.plus(unbacked))
                  .toFixed();
            const formattedBaseLTVasCollateral = normalize(baseLTVasCollateral, LTV_PRECISION);
            // const formattedEModeLtv = normalize(eModeLtv, LTV_PRECISION);
            const reserveFactor = normalize(item.reserveFactor.toString(), LTV_PRECISION);
            const supplyAPY = normalize(supplyAPYCalculate, RAY_DECIMALS);
            const supplyAPR = normalize(liquidityRate, RAY_DECIMALS);
            const variableBorrowAPY = normalize(variableBorrowAPYCalculate, RAY_DECIMALS);
            const variableBorrowAPR = normalize(variableBorrowRate, RAY_DECIMALS);
            const stableBorrowAPY = normalize(variableBorrowRateCalculate, RAY_DECIMALS);
            const stableBorrowAPR = normalize(stableBorrowRate, RAY_DECIMALS);
            const formattedReserveLiquidationThreshold = normalize(reserveLiquidationThreshold, 4);
            // const formattedEModeLiquidationThreshold = normalize(eModeLiquidationThreshold, 4);
            // const formattedReserveLiquidationBonus = normalize(
            //   valueToBigNumber(reserveLiquidationBonus).minus(10 ** LTV_PRECISION),
            //   4
            // );
            // const formattedEModeLiquidationBonus = normalize(
            //   valueToBigNumber(eModeLiquidationBonus).minus(10 ** LTV_PRECISION),
            //   4
            // );
            const totalScaledVariableDebt = normalizeWithReserve(item.totalVariableDebt.toString());
            const totalPrincipalStableDebt = '0';
            // const debtCeilingUSD = isIsolated
            //   ? normalize(item.debtCeiling.toString(), debtCeilingDecimals)
            //   : '0';
            // const isolationModeTotalDebtUSD = isIsolated
            //   ? normalize(isolationModeTotalDebt, debtCeilingDecimals)
            //   : '0';
            // const availableDebtCeilingUSD = isIsolated
            // ? normalize(
            //     valueToBigNumber(item.debtCeiling.toString()).minus(isolationModeTotalDebt,)debtCeilingDecimals,
            //   )
            // : '0';

            return {
              // ...item,
              baseLTVasCollateral,
              formattedBaseLTVasCollateral,
              supplyAPR,
              formattedReserveLiquidationThreshold,
              liquidityRate,
              variableBorrowRate,
              stableBorrowRate,
              reserveLiquidationThreshold,
              reserveLiquidationBonus: '10750',
              usageAsCollateralEnabled: true,
              borrowingEnabled: true,
              stableBorrowRateEnabled: false,
              aTokenAddress: '0x1c0E06a0b1A4c160c17545FF2A951bfcA57C0002',
              stableDebtTokenAddress: '0xBDfa7DE5CF7a7DdE4F023Cac842BF520fcF5395C',
              variableDebtTokenAddress: '0x08a8Dc81AeA67F84745623aC6c72CDA3967aab8b',
              interestRateStrategyAddress: '0x48AF11111764E710fcDcE2750db848C63edab57B',
              availableLiquidity,
              averageStableRate: '0',
              stableDebtLastUpdateTimestamp: 0,
              totalScaledVariableDebt,
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
              totalDebt,
              totalLiquidity,
              borrowUsageRatio,
              supplyUsageRatio,
              formattedReserveLiquidationBonus: '0.075',
              formattedEModeLiquidationBonus: '0.01',
              formattedEModeLiquidationThreshold: formattedReserveLiquidationThreshold,
              formattedEModeLtv: '0',
              formattedAvailableLiquidity,
              unborrowedLiquidity,
              variableBorrowAPR,
              debtCeilingUSD: '0',
              isolationModeTotalDebtUSD: '0',
              availableDebtCeilingUSD: '0',
              isIsolated,
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
              iconSymbol: item.symbol,
              isEmodeEnabled: true,
              isWrappedBaseAsset: false,
              reserve: {
                borrowCap,
                supplyCap,
                variableBorrowIndex,
                lastUpdateTimestamp,
                baseLTVasCollateral,
                reserveLiquidationThreshold,
                liquidityRate,
                variableBorrowRate,
                stableBorrowRate,
                availableLiquidity,
                formattedBaseLTVasCollateral,
                formattedReserveLiquidationThreshold,
                supplyAPR,
                decimals: Number(item.decimals),
                reserveLiquidationBonus: '10750',
                usageAsCollateralEnabled: true,
                borrowingEnabled: true,
                stableBorrowRateEnabled: false,
                aTokenAddress: '0x1c0E06a0b1A4c160c17545FF2A951bfcA57C0002',
                stableDebtTokenAddress: '0xBDfa7DE5CF7a7DdE4F023Cac842BF520fcF5395C',
                variableDebtTokenAddress: '0x08a8Dc81AeA67F84745623aC6c72CDA3967aab8b',
                interestRateStrategyAddress: '0x48AF11111764E710fcDcE2750db848C63edab57B',
                averageStableRate: '0',
                stableDebtLastUpdateTimestamp: 0,
                totalScaledVariableDebt,
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
                totalDebt,
                totalLiquidity,
                borrowUsageRatio,
                supplyUsageRatio,
                formattedReserveLiquidationBonus: '0.075',
                formattedEModeLiquidationBonus: '0.01',
                formattedEModeLiquidationThreshold: formattedReserveLiquidationThreshold,
                formattedEModeLtv: '0',
                supplyAPY,
                variableBorrowAPY,
                stableBorrowAPY,
                formattedAvailableLiquidity,
                unborrowedLiquidity,
                variableBorrowAPR,
                stableBorrowAPR,
                debtCeilingUSD: '0',
                isolationModeTotalDebtUSD: '0',
                availableDebtCeilingUSD: '0',
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
                iconSymbol: item.symbol,
                isEmodeEnabled: true,
                isWrappedBaseAsset: false,
                id: `10-${item.underlyingAddress
                  .toString()
                  .toLocaleLowerCase()}-0x2f39d218133afab8f2b819b1066c7e434ad94e9e`,
                underlyingAsset: item.underlyingAddress.toString().toLocaleLowerCase(),
                name: item.name,
                symbol: item.symbol,
                reserveFactor,
                isPaused: item.isPaused,
                debtCeiling: item.debtCeiling.toString(),
                isActive: item.isActive,
                isFrozen: item.isFrozen,
                liquidityIndex: item.liquidityIndex.toString(),
                // accruedToTreasury: item.accruedToTreasury.toString(),
                totalVariableDebt,
                totalStableDebt,
                isIsolated,
                totalPrincipalStableDebt,
              },

              availableToDeposit: '0',
              availableToDepositUSD: '0',
              usageAsCollateralEnabledOnUser: true,
              totalVariableDebt,
              totalStableDebt,
              totalPrincipalStableDebt,
              detailsAddress: item.underlyingAddress.toString().toLocaleLowerCase(),
              name: item.name || 'Fake coin',
              symbol: item.symbol || 'Fake coin',
              decimals: Number(item.decimals),
              variableBorrowIndex,
              walletBalance: walletBalance?.toString() || '0',
              isActive: item.isActive,
              isFrozen: item.isFrozen,
              isPaused: item.isPaused,
              debtCeiling: item.debtCeiling.toString(),
              // accruedToTreasury: item.accruedToTreasury.toString(),

              //
              currentLiquidityRate: item.currentLiquidityRate.toString(),
              lastUpdateTimestamp,
              liquidityIndex: item.liquidityIndex.toString(),
              reserveFactor,
              borrowCap,
              supplyCap,
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
              // stableBorrowIndex: item.stableBorrowIndex.toString(),
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
              supplyAPY,
              stableBorrowAPR,
              stableBorrowAPY,
              variableBorrowAPY,
              borrowRateMode: 'Variable',
              reserveID: item.reserveID.toString(),
              totalSupply: item.totalSupply.toString(),
              liquidity: formatUnits(item.liquidity || '0', item.decimals),
            };
          })
        );

        const mergedArray = JSON.parse(JSON.stringify([...arr]));

        setReservesTon(mergedArray as DashboardReserve[]);
      } catch (error) {
        await sleep(1000);
        console.error(`Error fetching getValueReserve (attempt ${attempts}):`, error);
        if (attempts < maxAttempts) {
          console.log('Retrying...getValueReserve');
          await fetchData();
        } else {
          console.log('Max attempts reached, stopping retries.');
          setReservesTon([]);
        }
      }
    };

    await fetchData();
  }, [
    client,
    onGetBalanceTonNetwork,
    poolContract,
    poolContractReservesData,
    walletAddressTonWallet,
  ]);

  useEffect(() => {
    if (isConnectedTonWallet) {
      getValueReserve();
    }
  }, [getValueReserve, isConnectedTonWallet, poolContract]);

  useEffect(() => {
    const newReserves = reservesTon.map((reserve) => {
      const dataById = ExchangeRateListUSD?.find(
        (subItem) => subItem.address === reserve.underlyingAssetTon
      );

      const numberFormateUSD = Number(dataById?.usd || 0)
        .toFixed(0)
        .toString();

      const priceInUSD = Number(formatUnits(numberFormateUSD, dataById?.decimal)).toString();

      const formattedPriceInUSD = Number(
        formatUnits(numberFormateUSD, dataById?.decimal)
      ).toString();

      const walletBalance =
        !reserve?.isJetton && Number(reserve.walletBalance) !== Number(yourWalletBalanceTon)
          ? yourWalletBalanceTon
          : reserve.walletBalance;

      const walletBalanceUSD = valueToBigNumber(formattedPriceInUSD)
        .multipliedBy(walletBalance || 0)
        .toString();

      const totalLiquidityUSD = valueToBigNumber(formattedPriceInUSD)
        .multipliedBy(reserve.totalLiquidity || 0)
        .toString();

      const availableLiquidityUSD = valueToBigNumber(formattedPriceInUSD)
        .multipliedBy(reserve.formattedAvailableLiquidity || 0)
        .toString();

      const borrowCapUSD = valueToBigNumber(formattedPriceInUSD)
        .multipliedBy(reserve.borrowCap || 0)
        .toString();

      const supplyCapUSD = valueToBigNumber(formattedPriceInUSD)
        .multipliedBy(reserve.supplyCap || 0)
        .toString();

      const totalVariableDebtUSD = valueToBigNumber(formattedPriceInUSD)
        .multipliedBy(reserve.totalVariableDebt || 0)
        .toString();

      const totalStableDebtUSD = valueToBigNumber(formattedPriceInUSD)
        .multipliedBy(reserve.totalStableDebt || 0)
        .toString();

      if (dataById?.address === address_pools) {
        setGasFeeTonMarketReferenceCurrency(
          valueToBigNumber(formattedPriceInUSD)
            .multipliedBy(GAS_FEE_TON || 0)
            .toString()
        );
      }

      return {
        ...reserve,
        walletBalance,
        walletBalanceUSD,
        priceInUSD,
        formattedPriceInMarketReferenceCurrency: priceInUSD,
        priceInMarketReferenceCurrency: formattedPriceInUSD,
        totalLiquidityUSD,
        availableLiquidityUSD,
        borrowCapUSD,
        supplyCapUSD,
        totalVariableDebtUSD,
        totalDebtUSD: totalVariableDebtUSD,
        totalStableDebtUSD,
        reserve: {
          ...reserve.reserve,
          walletBalance,
          walletBalanceUSD,
          priceInUSD,
          formattedPriceInMarketReferenceCurrency: priceInUSD,
          priceInMarketReferenceCurrency: formattedPriceInUSD,
          totalLiquidityUSD,
          availableLiquidityUSD,
          borrowCapUSD,
          supplyCapUSD,
          totalVariableDebtUSD,
          totalDebtUSD: totalVariableDebtUSD,
          totalStableDebtUSD,
        },
      };
    });
    if (JSON.stringify(newReserves) !== JSON.stringify(reservesTon)) {
      if (!isConnectedTonWallet) {
        setReservesTon([]);
      } else {
        console.log('Assets to supply---------------', newReserves);
        setReservesTon(newReserves);
      }
      setLoading(false);
    }
  }, [reservesTon, ExchangeRateListUSD, isConnectedTonWallet, yourWalletBalanceTon]);

  const symbolTon = 'ETHx';

  return {
    symbolTon,
    reservesTon,
    userTon,
    address: 'counterContract?.address.toString()',
    loading: loading || loadingTokenTon,
    getValueReserve,
    getPoolContractGetReservesData,
    setReservesTon,
    gasFeeTonMarketReferenceCurrency,
    yourWalletBalanceTon,
  };
};
