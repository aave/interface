import {
  BigNumberValue,
  getCompoundedBalance,
  getLinearBalance,
  getMarketReferenceCurrencyAndUsdBalance,
  normalize,
} from '@aave/math-utils';
import { Address } from '@ton/core';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { Pool } from 'src/contracts/Pool';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { sleep } from 'src/utils/rotationProvider';

import { address_pools, MAX_ATTEMPTS } from './app-data-provider/useAppDataProviderTon';
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

  const getYourSupplies = useCallback(async () => {
    let attempts = 0;
    const maxAttempts = MAX_ATTEMPTS;
    if (!isConnectedTonWallet) {
      setUserSupplies([]);
      setContractUserTon('');
    }
    const fetchData = async () => {
      try {
        attempts++;
        if (!client || !address_pools || !yourAddressWallet) return;
        const poolContract = client.open(Pool.createFromAddress(Address.parse(address_pools)));
        const res = await poolContract.getUserData(Address.parse(yourAddressWallet));
        const contractUserTon = await poolContract.getUserAddress(Address.parse(yourAddressWallet));
        setContractUserTon(contractUserTon.toString());
        const data = res.map((item) => {
          return {
            ...item,
            supplyBalance: item.totalSupply.toString(),
            underlyingAddress: item.underlyingAddress.toString(),
            liquidityIndex: item.liquidityIndex.toString(),
          };
        });

        return setUserSupplies(data);
      } catch (error) {
        await sleep(1000);
        console.error(`Error fetching getYourSupplies (attempt ${attempts}):`, error);
        if (attempts < maxAttempts) {
          console.log('Retrying...getYourSupplies');
          setUserSupplies([]);
          await fetchData();
        } else {
          console.log('Max attempts reached, stopping retries. getYourSupplies');
          setUserSupplies([]);
        }
      } finally {
        if (attempts >= maxAttempts || (attempts < maxAttempts && userSupplies.length > 0)) {
          return;
        }
      }
    };

    await fetchData();
  }, [client, isConnectedTonWallet, userSupplies.length, yourAddressWallet]);

  useEffect(() => {
    setLoading(true);
    getYourSupplies();
  }, [getYourSupplies, yourAddressWallet, isConnectedTonWallet]);

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

            const isCollateral =
              matchedSupply?.isCollateral === undefined || matchedSupply?.isCollateral === true
                ? true
                : false;

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
