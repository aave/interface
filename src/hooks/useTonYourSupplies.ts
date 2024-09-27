import {
  BigNumberValue,
  getCompoundedBalance,
  getLinearBalance,
  getMarketReferenceCurrencyAndUsdBalance,
  normalize,
  valueToBigNumber,
} from '@aave/math-utils';
import { Address } from '@ton/core';
import dayjs from 'dayjs';
import { BigNumber } from 'ethers';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { Pool } from 'src/contracts/Pool';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { sleep } from 'src/utils/rotationProvider';
import { retry } from 'ts-retry-promise';

import { address_pools, MAX_ATTEMPTS_50 } from './app-data-provider/useAppDataProviderTon';
import { FormattedUserReserves } from './pool/useUserSummaryAndIncentives';
import { useTonClient } from './useTonClient';

export interface UseTransactionHandlerTonProps {
  yourAddressWallet: string;
}

export interface UserSuppliesType {
  supplyBalance: string;
  underlyingAddress: string;
  liquidityIndex: string;
  totalSupply: number | bigint;
  isCollateral: boolean;
  variableBorrowBalance: number | bigint;
  variableBorrowIndex: bigint;
  stableBorrowBalance: number | bigint;
  stableBorrowRate: bigint;
  stableLastUpdateTimestamp: bigint;
}

export const useTonYourSupplies = (yourAddressWallet: string, reserves: DashboardReserve[]) => {
  const { isConnectedTonWallet } = useTonConnectContext();
  const client = useTonClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [yourSuppliesTon, setYourSuppliesTon] = useState<FormattedUserReserves[]>([]);
  const [userSupplies, setUserSupplies] = useState<UserSuppliesType[]>([]);
  const [contractUserTon, setContractUserTon] = useState<string>('');

  const getAssetCollateralTypeTon = (
    underlyingBalance: string,
    isCollateral: boolean | undefined
  ) => {
    if (valueToBigNumber(underlyingBalance).eq(0)) {
      return true;
    } else {
      if (isCollateral || isCollateral === undefined) {
        return true;
      } else {
        return false;
      }
    }
  };

  const getYourSupplies = useCallback(async () => {
    if (!isConnectedTonWallet) {
      setUserSupplies([]);
      setContractUserTon('');
      setLoading(false);
      return;
    }

    try {
      await retry(
        async () => {
          if (!client || !address_pools || !yourAddressWallet) return;

          // Open the pool contract using the address
          const poolContract = client.open(Pool.createFromAddress(Address.parse(address_pools)));

          // Fetch user data from the pool contract
          const res = await poolContract.getUserData(Address.parse(yourAddressWallet));
          const contractUserTon = await poolContract.getUserAddress(
            Address.parse(yourAddressWallet)
          );
          setContractUserTon(contractUserTon.toString());

          // Map the response to the format you need
          const data = res.map((item) => ({
            ...item,
            supplyBalance: item.totalSupply.toString(),
            underlyingAddress: item.underlyingAddress.toString(),
            liquidityIndex: item.liquidityIndex.toString(),
          }));

          // Update the state with the fetched supplies data
          setUserSupplies(data);
        },
        {
          retries: MAX_ATTEMPTS_50, // Maximum number of retries
          delay: 1000, // Delay between retries (1 second)
        }
      );
    } catch (error) {
      console.error('Failed to fetch supplies after retries:', error);
      setUserSupplies([]); // Set empty data in case of failure
    }
  }, [client, isConnectedTonWallet, yourAddressWallet]);

  useEffect(() => {
    setLoading(true);
    getYourSupplies();
  }, [getYourSupplies, isConnectedTonWallet]);

  const onMatchDataYourSupplies = useCallback(async () => {
    try {
      const result = await Promise.all(
        _.chain(reserves)
          .filter((reserve) =>
            _.some(
              userSupplies,
              (yourSupply) => reserve.underlyingAssetTon === yourSupply.underlyingAddress.toString()
            )
          )
          .map(async (reserve) => {
            const {
              priceInMarketReferenceCurrency,
              decimals,
              liquidityIndex,
              liquidityRate,
              lastUpdateTimestamp,
              variableBorrowIndex,
              variableBorrowRate,
            } = reserve;

            const normalizeWithReserve = (n: BigNumberValue) => normalize(n, decimals);

            const matchedSupply = _.find(
              userSupplies,
              (yourSupply) => reserve.underlyingAssetTon === yourSupply.underlyingAddress.toString()
            );

            const underlyingBalance = getLinearBalance({
              balance: matchedSupply?.supplyBalance.toString() || '0', // reserve.scaledATokenBalance
              index: liquidityIndex,
              rate: liquidityRate,
              lastUpdateTimestamp: lastUpdateTimestamp,
              currentTimestamp: dayjs().unix(),
            });

            const balanceRequest = {
              balance: matchedSupply?.supplyBalance.toString() || '0',
              priceInMarketReferenceCurrency: priceInMarketReferenceCurrency,
              marketReferenceCurrencyDecimals: decimals,
              decimals: decimals,
              marketReferencePriceInUsdNormalized: priceInMarketReferenceCurrency,
            };

            const { marketReferenceCurrencyBalance: underlyingBalanceMarketReferenceCurrency } =
              getMarketReferenceCurrencyAndUsdBalance(balanceRequest);

            const variableBorrows = getCompoundedBalance({
              principalBalance: matchedSupply?.variableBorrowBalance.toString() || '0',
              reserveIndex: variableBorrowIndex,
              reserveRate: variableBorrowRate,
              lastUpdateTimestamp: lastUpdateTimestamp,
              currentTimestamp: dayjs().unix(),
            });

            const { marketReferenceCurrencyBalance: variableBorrowsMarketReferenceCurrency } =
              getMarketReferenceCurrencyAndUsdBalance({
                balance: variableBorrows,
                priceInMarketReferenceCurrency,
                marketReferenceCurrencyDecimals: decimals,
                decimals,
                marketReferencePriceInUsdNormalized: priceInMarketReferenceCurrency,
              });

            // const stableBorrows = getCompoundedStableBalance({
            //   principalBalance: principalStableDebt,
            //   userStableRate: stableBorrowRate,
            //   lastUpdateTimestamp: stableBorrowLastUpdateTimestamp,
            //   currentTimestamp,
            // });

            // const {
            //   marketReferenceCurrencyBalance: stableBorrowsMarketReferenceCurrency,
            //   usdBalance: stableBorrowsUSD,
            // } = getMarketReferenceCurrencyAndUsdBalance({
            //   balance: stableBorrows,
            //   priceInMarketReferenceCurrency,
            //   marketReferenceCurrencyDecimals,
            //   decimals,
            //   marketReferencePriceInUsdNormalized,
            // });

            const stableBorrowsMarketReferenceCurrency = 0;

            const totalBorrowsMarketReferenceCurrency = variableBorrowsMarketReferenceCurrency.plus(
              stableBorrowsMarketReferenceCurrency
            );

            const isCollateral = getAssetCollateralTypeTon(
              underlyingBalance.toString(),
              matchedSupply?.isCollateral
            );

            return {
              ...reserve,
              underlyingBalance: normalizeWithReserve(underlyingBalance),
              underlyingBalanceUSD: normalize(underlyingBalanceMarketReferenceCurrency, 0),

              variableBorrows: normalizeWithReserve(variableBorrows),
              variableBorrowsUSD: normalize(variableBorrowsMarketReferenceCurrency, 0),

              usageAsCollateralEnabledOnUser: matchedSupply?.isCollateral,
              usageAsCollateralEnabled: isCollateral,

              id: reserve.id,
              underlyingAsset: reserve.underlyingAsset,
              scaledATokenBalance: reserve.scaledATokenBalance,
              stableBorrowRate: reserve.stableBorrowRate,
              scaledVariableDebt: reserve.scaledVariableDebt,
              principalStableDebt: reserve.principalStableDebt,
              stableBorrowLastUpdateTimestamp: reserve.stableBorrowLastUpdateTimestamp,

              underlyingBalanceMarketReferenceCurrency: normalize(
                underlyingBalanceMarketReferenceCurrency,
                0
              ),
              variableBorrowsMarketReferenceCurrency: normalize(
                variableBorrowsMarketReferenceCurrency,
                0
              ),
              totalBorrowsMarketReferenceCurrency: normalize(
                totalBorrowsMarketReferenceCurrency,
                0
              ),

              reserve: {
                ...reserve.reserve,
                underlyingBalance: normalizeWithReserve(underlyingBalance),
                underlyingBalanceUSD: normalize(underlyingBalanceMarketReferenceCurrency, 0),

                variableBorrows: normalizeWithReserve(variableBorrows),
                variableBorrowsUSD: normalize(variableBorrowsMarketReferenceCurrency, 0),

                usageAsCollateralEnabled: isCollateral,

                id: reserve.id,
                underlyingAsset: reserve.underlyingAsset,
                scaledATokenBalance: reserve.scaledATokenBalance,
                stableBorrowRate: reserve.stableBorrowRate,
                scaledVariableDebt: reserve.scaledVariableDebt,
                principalStableDebt: reserve.principalStableDebt,
                stableBorrowLastUpdateTimestamp: reserve.stableBorrowLastUpdateTimestamp,

                underlyingBalanceMarketReferenceCurrency: normalize(
                  underlyingBalanceMarketReferenceCurrency,
                  0
                ),
                variableBorrowsMarketReferenceCurrency: normalize(
                  variableBorrowsMarketReferenceCurrency,
                  0
                ),
                totalBorrowsMarketReferenceCurrency: normalize(
                  totalBorrowsMarketReferenceCurrency,
                  0
                ),
              },
            };
          })
          .value()
      );

      setYourSuppliesTon(result as FormattedUserReserves[]);
    } catch (error) {
      console.error('Error fetching supplies:', error);
      setYourSuppliesTon([]);
    } finally {
      await sleep(500);
      setLoading(false);
    }
  }, [reserves, userSupplies]);

  useEffect(() => {
    onMatchDataYourSupplies();
  }, [onMatchDataYourSupplies, yourAddressWallet, isConnectedTonWallet, reserves, userSupplies]);

  return {
    yourSuppliesTon,
    getYourSupplies,
    contractUserTon,
    loading,
  };
};
