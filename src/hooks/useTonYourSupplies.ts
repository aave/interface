import { Address } from '@ton/core';
import { useCallback, useEffect, useState } from 'react';
import { Pool } from 'src/contracts/Pool';
import { Reserve } from 'src/contracts/Reserve';
import { User } from 'src/contracts/User';

import { address_pools } from './app-data-provider/useAppDataProviderTon';
// import { useContract } from './useContract';
import { useTonClient } from './useTonClient';

export const useTonYourSupplies = (yourAddressWallet: string) => {
  const client = useTonClient();
  // const userProviderTon = useContract<User>(yourAddressWallet, User);
  // const poolContract = useContract<Pool>(address_pools, Pool);
  const [yourSuppliesTon] = useState<unknown>();

  const onGetYourSupplies = useCallback(async () => {
    if (!client || !address_pools || !yourAddressWallet) return;
    // const reserveAddress = await poolContract.getReserveAddress(
    //   Address.parse(`EQBE2AjF6woqdvZfJSbBMyQl3gLPyhk8bEr2wl4v_r7DENcN`)
    // );
    // const reserveContract = client.open(Reserve.createFromAddress(reserveAddress));
    // const userAddress = await reserveContract.getUserAddress(Address.parse(yourAddressWallet));
    // const userContract = client.open(User.createFromAddress(userAddress));

    console.log('--------------------------yourAddressWallet');
    const poolContract = client.open(Pool.createFromAddress(Address.parse(address_pools)));
    const reserveAddress = await poolContract.getReserveAddress(
      Address.parse(`EQCbxY-AU6R_imQQdNHK-DQfR16IQv5c3MxSlh5WtqeEJToi`)
    );
    console.log('--------------------------1', await poolContract.getReservesList());
    const reserveContract = client.open(Reserve.createFromAddress(reserveAddress));
    console.log('--------------------------2', await reserveContract.getReserveData());
    const userAddress = await reserveContract.getUserAddress(Address.parse(yourAddressWallet));
    console.log('--------------------------3');
    const userContract = client.open(User.createFromAddress(userAddress));
    console.log('--------------------------4', await userContract.getUserData());
    const res = await userContract.getUserSupplies();
    console.log('--------------------------5');
    console.log('yourSuppliesTon-------', res);
    // const data = await userProviderTon.getUserSupplies();
    // console.log('data---------supplies');
    // setYourSuppliesTon(data);
  }, [client, yourAddressWallet]);

  useEffect(() => {
    onGetYourSupplies();
  }, [client, onGetYourSupplies, yourAddressWallet]);

  return {
    yourSuppliesTon,
  };
};
