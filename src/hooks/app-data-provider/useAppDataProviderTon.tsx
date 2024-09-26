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
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { formatUnits } from 'ethers/lib/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pool } from 'src/contracts/Pool';
import { useContractUnNotAuth } from 'src/hooks/useContract';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { useRootStore } from 'src/store/root';
import { calculateReserveDebt } from 'src/utils/calculate-reserve-debt';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { sleep } from 'src/utils/rotationProvider';

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
  walletBalance?: string;

  // accruedToTreasury: bigint | 0;
  // image_data?: string | undefined;
  // stableBorrowIndex: bigint | string | 0 | number;
}

export const address_pools = 'EQDKpw4iTQADUmx2CnZXB2z_2T_9Xg2xRKbYbMmk0fH0OMlh';
export const MAX_ATTEMPTS = 10;
export const MAX_ATTEMPTS_50 = 50;
export const GAS_FEE_TON = 0.3;
export const API_TON_V2 = 'https://testnet.toncenter.com/api/v2';
export const API_TON_V3 = 'https://testnet.toncenter.com/api/v3';
export const API_TON_SCAN_V2 = 'https://testnet.tonapi.io/v2';
export const SCAN_TRANSACTION_TON = 'https://testnet.tonviewer.com';
export const SCAN_TRANSACTION_TON_HISTORY = 'https://testnet.tonviewer.com/transaction';
export const URL_API_BE = 'https://aave-ton-api.sotatek.works';

export const OP_CODE_SUPPLY = '0x1530f236';
export const OP_CODE_BORROW = '0xdf316703';
export const OP_CODE_REPAY = '0x95cded06';
export const OP_CODE_WITHDRAW = '0x2572afa4';
export const OP_CODE_COLLATERAL_UPDATE = '0xab476844';

export const defaultRateUSDNotValue = [
  {
    id: 'dai',
    address: 'EQDPC-_3w_fGyJd-gxxmP8CO_zQC2i3dt-B4D-lNQFwD_YvO',
    usd: '0',
  },
  {
    id: 'usd-coin',
    address: 'EQAw6XehcP3V5DEc6uC9F1lUTOLXjElDOpGmNLVZzZPn4E3y',
  },
  {
    id: 'tether',
    address: 'EQD1h97vd0waJaIsqwYN8BOffL1JJPExBFCrrIgCHDdLeSjO',
  },
  {
    id: 'the-open-network',
    address: address_pools,
  },
];

export const useAppDataProviderTon = (ExchangeRateListUSD: WalletBalanceUSD[]) => {
  const [setAccount] = useRootStore((store) => [store.setAccount, store.currentChainId]);
  const [loading, setLoading] = useState<boolean>(false);
  const [reservesTon, setReservesTon] = useState<DashboardReserve[]>([]);
  const [gasFeeTonMarketReferenceCurrency, setGasFeeTonMarketReferenceCurrency] = useState<
    number | string
  >('0');
  const [poolContractReservesData, setPoolContractReservesData] = useState<
    PoolContractReservesDataType[]
  >([]);
  const poolContractNotAuth = useContractUnNotAuth<Pool>(address_pools, Pool);
  const { isConnectedTonWallet, walletAddressTonWallet } = useTonConnectContext();
  const { onGetBalancesTokenInWalletTon } = useGetBalanceTon();

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
      const maxAttempts = MAX_ATTEMPTS_50;

      while (attempts < maxAttempts) {
        try {
          attempts++;

          setLoading(pauseReload ? false : true);

          // Check if the pool contract is available
          if (!poolContractNotAuth) {
            console.error('poolContractNotAuth is not available.');
            return;
          }

          // Fetch reserves data from the pool contract
          const reserves = await poolContractNotAuth.getReservesData();

          if (reserves) {
            // Retrieve token balances from the user's wallet in the TON network
            const balances = await onGetBalancesTokenInWalletTon(
              reserves as PoolContractReservesDataType[],
              walletAddressTonWallet,
              isConnectedTonWallet
            );

            // Process reserves data with wallet balances
            const data = reserves.map((item) => {
              // Find the corresponding wallet balance
              const result = balances.find(
                (balance) =>
                  balance.underlyingAddress ===
                  item.underlyingAddress.toString().toLocaleLowerCase()
              );

              // If balance is found, use it; otherwise, set to '0'
              const walletBalance = result ? result.walletBalance : '0';

              // Return the updated item with the calculated walletBalance
              return {
                ...item,
                walletBalance,
              };
            });

            // Set the final calculated data into the state
            setPoolContractReservesData(data as PoolContractReservesDataType[]);

            // Break the loop since data is successfully fetched and processed
            break;
          }
        } catch (error) {
          console.error(
            `Error fetching getPoolContractGetReservesData (attempt ${attempts}):`,
            error
          );

          if (attempts >= maxAttempts) {
            console.log('Max attempts reached, stopping retries.');
            setPoolContractReservesData([]); // Set empty data if max attempts are reached
            break; // Exit the loop when max attempts are reached
          } else {
            console.log('Retrying...getPoolContractGetReservesData');
          }
        }
      }
    },
    [
      isConnectedTonWallet,
      onGetBalancesTokenInWalletTon,
      poolContractNotAuth,
      walletAddressTonWallet,
    ]
  );

  useEffect(() => {
    setLoading(true);
    setPoolContractReservesData([]);
    getPoolContractGetReservesData();
  }, [isConnectedTonWallet, getPoolContractGetReservesData]);

  const getMapValueReserve = useCallback(async () => {
    try {
      const arr = await Promise.all(
        poolContractReservesData.map(async (item) => {
          const decimals = Number(item.decimals);
          const normalizeWithReserve = (n: BigNumberValue) => normalize(n, decimals);
          // const isIsolated = item.debtCeiling.toString() !== '0'; // todo
          const isIsolated = false;

          const stableBorrows = 0;
          const unbacked = 0;
          const poolJettonWalletAddress = item.poolJWAddress.toString();
          const borrowCap = formatUnits(item.borrowCap || '0', decimals);
          const supplyCap = formatUnits(item.supplyCap || '0', decimals);
          const liquidity = item.liquidity.toString().substring(0, RAY_DECIMALS); // cut from 0 to 27 index
          // const availableLiquidity = valueToBigNumber(liquidity); // SC confirm = liquidity --> remove .minus(totalBorrowed)
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

          /**
           * availableLiquidity returned by the helper is the amount of unborrowed tokens
           * the actual availableLiquidity might be lower due to borrowCap
           */
          const availableLiquidity =
            borrowCap === '0'
              ? new BigNumber(liquidity)
              : BigNumber.min(
                  liquidity,
                  new BigNumber(borrowCap).shiftedBy(decimals).minus(
                    // plus 1 as the cap is exclusive
                    totalDebtCalculate.plus(1)
                  )
                );

          const totalVariableDebt = normalizeWithReserve(totalVariableDebtCalculate);
          const totalStableDebt = normalizeWithReserve(totalStableDebtCalculate);
          const totalLiquidity = normalizeWithReserve(totalLiquidityCalculate);
          const formattedAvailableLiquidity = normalizeWithReserve(availableLiquidity);
          const unborrowedLiquidity = normalizeWithReserve(availableLiquidity);
          const totalDebt = normalizeWithReserve(totalDebtCalculate);
          const borrowUsageRatio = totalLiquidityCalculate.eq(0)
            ? '0'
            : valueToBigNumber(totalDebtCalculate).dividedBy(totalLiquidityCalculate).toFixed();
          const supplyUsageRatio = totalLiquidityCalculate.eq(0)
            ? '0'
            : valueToBigNumber(totalDebtCalculate)
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
            walletBalanceUSD: '0',
            priceInUSD: '0',
            formattedPriceInMarketReferenceCurrency: '0',
            priceInMarketReferenceCurrency: '0',
            totalLiquidityUSD: '0',
            availableLiquidityUSD: '0',
            borrowCapUSD: '0',
            supplyCapUSD: '0',
            totalVariableDebtUSD: '0',
            totalDebtUSD: '0',
            totalStableDebtUSD: '0',

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
            aTokenAddress: '',
            stableDebtTokenAddress: '0xBDfa7DE5CF7a7DdE4F023Cac842BF520fcF5395C',
            variableDebtTokenAddress: '0x08a8Dc81AeA67F84745623aC6c72CDA3967aab8b',
            interestRateStrategyAddress: '0x48AF11111764E710fcDcE2750db848C63edab57B',
            availableLiquidity,
            averageStableRate: '0',
            stableDebtLastUpdateTimestamp: 0,
            totalScaledVariableDebt,
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
              walletBalanceUSD: '0',
              priceInUSD: '0',
              formattedPriceInMarketReferenceCurrency: '0',
              priceInMarketReferenceCurrency: '0',
              totalLiquidityUSD: '0',
              availableLiquidityUSD: '0',
              borrowCapUSD: '0',
              supplyCapUSD: '0',
              totalVariableDebtUSD: '0',
              totalDebtUSD: '0',
              totalStableDebtUSD: '0',

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
              decimals,
              reserveLiquidationBonus: '10750',
              usageAsCollateralEnabled: true,
              borrowingEnabled: true,
              stableBorrowRateEnabled: false,
              aTokenAddress: '',
              stableDebtTokenAddress: '0xBDfa7DE5CF7a7DdE4F023Cac842BF520fcF5395C',
              variableDebtTokenAddress: '0x08a8Dc81AeA67F84745623aC6c72CDA3967aab8b',
              interestRateStrategyAddress: '0x48AF11111764E710fcDcE2750db848C63edab57B',
              averageStableRate: '0',
              stableDebtLastUpdateTimestamp: 0,
              totalScaledVariableDebt,
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
            decimals,
            variableBorrowIndex,
            walletBalance: item.walletBalance,
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
            liquidity: formatUnits(item.liquidity || '0', decimals),
          };
        })
      );

      const mergedArray = JSON.parse(JSON.stringify([...arr]));

      setReservesTon(mergedArray as DashboardReserve[]);
    } catch (error) {
      console.error(`Error fetching getValueReserve`, error);
    }
  }, [poolContractReservesData]);

  useEffect(() => {
    getMapValueReserve();
  }, [getMapValueReserve]);

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

      const walletBalanceUSD = valueToBigNumber(formattedPriceInUSD)
        .multipliedBy(reserve.walletBalance || 0)
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
      console.log('Assets to supply---------------', newReserves);
      setReservesTon(newReserves);
      sleep(2000);
      setLoading(false);
    }
  }, [reservesTon, ExchangeRateListUSD, isConnectedTonWallet]);

  const symbolTon = 'ETHx';

  return {
    symbolTon,
    reservesTon,
    userTon,
    address: 'counterContract?.address.toString()',
    loading: loading,
    getPoolContractGetReservesData,
    setReservesTon,
    gasFeeTonMarketReferenceCurrency,
  };
};
