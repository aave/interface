import { Address, OpenedContract } from '@ton/core';
import { useEffect, useState } from 'react';
import { JettonMinter } from 'src/contracts/JettonMinter';
import { JettonWallet } from 'src/contracts/JettonWallet';
import { Pool } from 'src/contracts/Pool';
import { useContract } from 'src/hooks/useContract';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';

import { useTonClient } from './useTonClient';

const address_pools = 'EQCvM_iN3f_bqO_ADopJ8SR8ix5YT8wDBxfuQQ6B0QNKbhzV';

export function useAppDataContextTonNetwork() {
  const { walletAddressTonWallet } = useTonConnectContext();
  const client = useTonClient();
  const [listPoolContract, setListPoolContract] = useState<unknown>([]);
  const [reservesTon, setReservesTon] = useState<unknown>([]);
  const poolContract = useContract<Pool>(address_pools, Pool);

  useEffect(() => {
    if (!poolContract) return;
    poolContract.getReservesList().then(setListPoolContract);
  }, [poolContract]);

  useEffect(() => {
    if (!poolContract || !client || !walletAddressTonWallet) return;

    const getValueReserve = async () => {
      const reserve = await poolContract.getReservesData();
      setReservesTon(reserve);

      if (reserve) {
        reserve.forEach(async ({ underlyingAsset }) => {
          const minterAddress =
            JettonMinter.createFromAddress(underlyingAsset)?.address.toRawString();
          if (!minterAddress) return;

          const contractJettonMinter = new JettonMinter(Address.parse(minterAddress));
          const providerJettonMinter = client.open(
            contractJettonMinter
          ) as OpenedContract<JettonMinter>;

          const walletAddressJettonMinter = await providerJettonMinter.getWalletAddress(
            Address.parse(walletAddressTonWallet)
          );

          const contractJettonWallet = new JettonWallet(
            Address.parse(walletAddressJettonMinter.toRawString())
          );
          const providerJettonWallet = client.open(
            contractJettonWallet
          ) as OpenedContract<JettonWallet>;

          const balance = await providerJettonWallet.getJettonBalance();
          console.log('Balance-------', balance.toString);
        });
      }
    };
    getValueReserve();
  }, [client, poolContract, walletAddressTonWallet]);

  return { reservesTon, listPoolContract, address: 'counterContract?.address.toString()' };
}
