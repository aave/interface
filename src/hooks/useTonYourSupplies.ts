import { Address } from '@ton/core';
import { useCallback, useEffect, useState } from 'react';
import { Pool } from 'src/contracts/Pool';
import { Reserve } from 'src/contracts/Reserve';
import { User } from 'src/contracts/User';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';

import { address_pools } from './app-data-provider/useAppDataProviderTon';
// import { useContract } from './useContract';
import { useTonClient } from './useTonClient';

export const useTonYourSupplies = (yourAddressWallet: string, reserves: DashboardReserve[]) => {
  const client = useTonClient();
  // const userProviderTon = useContract<User>(yourAddressWallet, User);
  // const poolContract = useContract<Pool>(address_pools, Pool);
  const [yourSuppliesTon] = useState<unknown>();

  const onGetYourSupply = useCallback(
    async (assetAddress: string) => {
      if (!client || !address_pools || !yourAddressWallet) return;
      // const reserveAddress = await poolContract.getReserveAddress(
      //   Address.parse(`EQBE2AjF6woqdvZfJSbBMyQl3gLPyhk8bEr2wl4v_r7DENcN`)
      // );
      // const reserveContract = client.open(Reserve.createFromAddress(reserveAddress));
      // const userAddress = await reserveContract.getUserAddress(Address.parse(yourAddressWallet));
      // const userContract = client.open(User.createFromAddress(userAddress));

      const poolContract = client.open(Pool.createFromAddress(Address.parse(address_pools)));
      const reserveAddress = await poolContract.getReserveAddress(Address.parse(assetAddress));
      const reserveContract = client.open(Reserve.createFromAddress(reserveAddress));

      const userAddress = await reserveContract.getUserAddress(Address.parse(yourAddressWallet));
      const userContract = client.open(User.createFromAddress(userAddress));
      const res = await userContract.getUserSupplies();

      console.log('yourSuppliesTon-----EQDPC-_3w_fGyJd-gxxmP8CO_zQC2i3dt-B4D-lNQFwD_YvO-----', res);
      return res[0];
      // const data = await userProviderTon.getUserSupplies();
      // console.log('data---------supplies');
      // setYourSuppliesTon(data);
    },
    [client, yourAddressWallet]
  );

  const getYourSupplies = useCallback(
    async (reserves: DashboardReserve[]) => {
      if (!client || !address_pools || !yourAddressWallet || !reserves) return;
      const yourSupplies = await Promise.all(
        reserves.map(async (item) => {
          if (item.underlyingAssetTon) {
            const res = await onGetYourSupply(item?.underlyingAssetTon);
            return res;
          }
        })
      );
      console.log('yourSupplies-----------', yourSupplies);
    },
    [client, yourAddressWallet, onGetYourSupply]
  );

  useEffect(() => {
    // onGetYourSupplies('EQAw6XehcP3V5DEc6uC9F1lUTOLXjElDOpGmNLVZzZPn4E3y');
    getYourSupplies(reserves);
  }, [client, onGetYourSupply, yourAddressWallet, reserves, getYourSupplies]);

  return {
    yourSuppliesTon,
  };
};
