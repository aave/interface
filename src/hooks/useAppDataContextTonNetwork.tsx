import { useEffect, useState } from 'react';
import { Pool } from 'src/contracts/Pool';
import { useContract } from 'src/hooks/useContract';
// import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';

const address_pools = 'EQCvM_iN3f_bqO_ADopJ8SR8ix5YT8wDBxfuQQ6B0QNKbhzV';

export function useAppDataContextTonNetwork() {
  // const { walletAddressTonWallet } = useTonConnectContext();
  const [listPoolContract, setListPoolContract] = useState<unknown>([]);
  const [reservesTon, setReservesTon] = useState<unknown>([]);
  const poolContract = useContract<Pool>(address_pools, Pool);

  useEffect(() => {
    async function getValuePools() {
      if (!poolContract) return;
      const val = await poolContract.getReservesList();
      setListPoolContract(val);
    }
    getValuePools();
  }, [poolContract]);

  useEffect(() => {
    async function getValueReserve() {
      if (!poolContract) return;
      const reserve = await poolContract.getReservesData();
      setReservesTon(reserve);
    }
    getValueReserve();
  }, [poolContract]);

  return {
    reservesTon,
    listPoolContract,
    address: 'counterContract?.address.toString()',
  };
}
