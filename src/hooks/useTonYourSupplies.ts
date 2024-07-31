import { Address } from '@ton/core';
import { formatUnits } from 'ethers/lib/utils';
import { useCallback, useEffect, useState } from 'react';
import { Pool } from 'src/contracts/Pool';
import { Reserve } from 'src/contracts/Reserve';
import { User } from 'src/contracts/User';
import { ExtendedFormattedUser } from 'src/hooks/pool/useExtendedUserSummaryAndIncentives';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';

import { address_pools } from './app-data-provider/useAppDataProviderTon';
// import { useContract } from './useContract';
import { useTonClient } from './useTonClient';

export const useTonYourSupplies = (yourAddressWallet: string, reserves: DashboardReserve[]) => {
  const client = useTonClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [userSummaryTon, setUserSummaryTon] = useState<ExtendedFormattedUser>();
  // const userProviderTon = useContract<User>(yourAddressWallet, User);
  // const poolContract = useContract<Pool>(address_pools, Pool);
  const [yourSuppliesTon, setYourSuppliesTon] = useState<unknown>([]);

  const onGetYourSupply = useCallback(
    async (assetAddress: string) => {
      if (!client || !address_pools || !yourAddressWallet) return;
      // const reserveAddress = await poolContract.getReserveAddress(
      //   Address.parse(`EQBE2AjF6woqdvZfJSbBMyQl3gLPyhk8bEr2wl4v_r7DENcN`)
      // );
      // const reserveContract = client.open(Reserve.createFromAddress(reserveAddress));
      // const userAddress = await reserveContract.getUserAddress(Address.parse(yourAddressWallet));
      // const userContract = client.open(User.createFromAddress(userAddress));
      // const data = await userProviderTon.getUserSupplies();
      // console.log('data---------supplies');
      // setYourSuppliesTon(data);

      const poolContract = client.open(Pool.createFromAddress(Address.parse(address_pools)));
      const reserveAddress = await poolContract.getReserveAddress(Address.parse(assetAddress));
      const reserveContract = client.open(Reserve.createFromAddress(reserveAddress));

      const userAddress = await reserveContract.getUserAddress(Address.parse(yourAddressWallet));
      const userContract = client.open(User.createFromAddress(userAddress));
      const res = await userContract.getUserSupplies();

      console.log(`yourSuppliesTon-----${assetAddress}-----`, res);
      return res[0];
    },
    [client, yourAddressWallet]
  );

  const getYourSupplies = useCallback(async () => {
    setLoading(true);

    if (!client || !address_pools || !yourAddressWallet || !reserves) {
      setLoading(false);
      return;
    }

    const yourSupplies: {
      reserveID: number;
      supplyBalance: bigint;
      stableBorrowBalance: bigint;
      variableBorrowBalance: bigint;
    }[] = [];

    await Promise.allSettled(
      reserves.map(async (item) => {
        if (item.underlyingAssetTon) {
          try {
            const res = await onGetYourSupply(item.underlyingAssetTon);
            if (res !== undefined) {
              console.log(
                'underlyingAssetTon-----------',
                item.underlyingAssetTon,
                res.supplyBalance,
                item
              );
              const underlyingBalance = formatUnits(res.supplyBalance || '0', item.decimals);
              const itemYourSupply = {
                ...res,
                ...item,
                underlyingBalance,
              };
              yourSupplies.push(itemYourSupply);
            }
          } catch (error) {
            console.error('Error fetching supply:', error);
          }
        }
      })
    );

    setYourSuppliesTon(yourSupplies);
    setLoading(false);
  }, [client, yourAddressWallet, onGetYourSupply, reserves]);

  useEffect(() => {
    getYourSupplies();
  }, [client, onGetYourSupply, yourAddressWallet, reserves, getYourSupplies]);

  useEffect(() => {
    const res = {
      userReservesData: yourSuppliesTon,
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
    setUserSummaryTon(res as ExtendedFormattedUser);
  }, [yourSuppliesTon]);

  return {
    yourSuppliesTon,
    getYourSupplies,
    loading,
    userSummaryTon,
  };
};
