/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper } from '@mui/material';
import { Contract } from 'ethers';
import * as React from 'react';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import MULTI_FEE_ABI from './MultiFeeABI';

interface NumReturn {
  _hex: string;
  _isBigNumber: boolean;
}

interface VestEntry {
  amount: number;
  expiry: string;
}

interface Claimables {
  amount: number;
  token: string;
}

export const ManageMainActions = () => {
  const [unlockedPAW, setUnlockedPAW] = React.useState(-1);
  const [vestedPAW, setVestedPAW] = React.useState(-1);
  const [exitPenalty, setExitPenalty] = React.useState(-1);
  const [expiredLockedPAW, setExpiredLockedPAW] = React.useState(-1);
  const [totalLockedPAW, setTotalLockedPAW] = React.useState(-1);
  const [totalClaimableValue, setTotalClaimableValue] = React.useState(-1);
  const [totalClaimedValue, setTotalClaimedValue] = React.useState(-1);
  const [vests, setVests] = React.useState<VestEntry[]>([]);
  const [locks, setLocks] = React.useState<VestEntry[]>([]);
  const [claimables, setClaimables] = React.useState<Claimables[]>([]);
  const [claimeds, setClaimeds] = React.useState<Claimables[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const { provider } = useWeb3Context();

  const MULTI_FEE_ADDR = marketsData.bsc_testnet_v3.addresses.MERKLE_DIST as string;

  // handle unlock action
  const handleClaimUnlock = () => {
    // create contract
    const contract = new Contract(MULTI_FEE_ADDR, MULTI_FEE_ABI, provider);

    const promises = [];

    // add contract call into promise arr
    promises.push(contract.duration());

    // call promise all nad handle sucess error
    Promise.all(promises)
      .then(() => {
        alert('success');
        setLoading(false);
      })
      .catch((e) => {
        alert('error');
        console.error(e);
      });
  };

  // handle claim all vest action
  const handleClaimAllVest = () => {
    // create contract
    const contract = new Contract(MULTI_FEE_ADDR, MULTI_FEE_ABI, provider);

    const promises = [];

    // add contract call into promise arr
    promises.push(contract.duration());

    // call promise all nad handle sucess error
    Promise.all(promises)
      .then(() => {
        alert('success');
        setLoading(false);
      })
      .catch((e) => {
        alert('error');
        console.error(e);
      });
  };

  // claim expired
  const handleClaimExpired = () => {
    // create contract
    const contract = new Contract(MULTI_FEE_ADDR, MULTI_FEE_ABI, provider);

    const promises = [];

    // add contract call into promise arr
    promises.push(contract.duration());

    // call promise all nad handle sucess error
    Promise.all(promises)
      .then(() => {
        alert('success');
        setLoading(false);
      })
      .catch((e) => {
        alert('error');
        console.error(e);
      });
  };

  // claim all
  const handleClaimAll = () => {
    // create contract
    const contract = new Contract(MULTI_FEE_ADDR, MULTI_FEE_ABI, provider);

    const promises = [];

    // add contract call into promise arr
    promises.push(contract.duration());

    // call promise all nad handle sucess error
    Promise.all(promises)
      .then(() => {
        alert('success');
        setLoading(false);
      })
      .catch((e) => {
        alert('error');
        console.error(e);
      });
  };

  React.useEffect(() => {
    // create contract
    const contract = new Contract(MULTI_FEE_ADDR, MULTI_FEE_ABI, provider);

    const promises = [];

    // add contract call into promise arr
    promises.push(contract.duration());
    promises.push(contract.duration());
    promises.push(contract.duration());
    promises.push(contract.duration());
    promises.push(contract.duration());
    promises.push(contract.duration());
    promises.push(contract.duration());
    promises.push(contract.duration());
    promises.push(contract.duration());
    promises.push(contract.duration());
    promises.push(contract.duration());

    // call promise all and get data
    Promise.all(promises)
      .then((data: NumReturn[]) => {
        // dev change data setting logic here
        setUnlockedPAW(parseInt(data[0]._hex, 16));
        setVestedPAW(parseInt(data[1]._hex, 16));
        setExitPenalty(parseInt(data[2]._hex, 16));
        setExpiredLockedPAW(parseInt(data[3]._hex, 16));
        setTotalLockedPAW(parseInt(data[4]._hex, 16));
        setTotalClaimableValue(parseInt(data[5]._hex, 16));
        setTotalClaimedValue(parseInt(data[6]._hex, 16));
        setVests([{ amount: parseInt(data[7]._hex, 16), expiry: '1-1-1111' }]);
        setLocks([{ amount: parseInt(data[8]._hex, 16), expiry: '1-1-1111' }]);
        setClaimables([{ amount: parseInt(data[9]._hex, 16), token: 'PAW' }]);
        setClaimeds([{ amount: parseInt(data[10]._hex, 16), token: 'PAW' }]);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, []);

  if (loading) return <Paper>loading...</Paper>;

  return (
    <Paper>
      <div>main actions</div>
      <div style={{ border: '1px solid black' }}>
        Unlocked paw {unlockedPAW} <button onClick={handleClaimUnlock}>Claim</button>
      </div>
      <div style={{ border: '1px solid black' }}>
        Vested paw {vestedPAW} penalty {exitPenalty}
        <div>
          Claim all <button onClick={handleClaimAllVest}>Claim</button>
        </div>
      </div>

      <div style={{ border: '1px solid black' }}>
        Expired locked paw {expiredLockedPAW} <button onClick={handleClaimExpired}>Claim</button>
      </div>

      <div style={{ border: '1px solid black' }}>
        <div>Vests</div>
        {vests.map((vest, i) => (
          <div key={i}>
            amount {vest.amount} exp {vest.expiry}
          </div>
        ))}
      </div>

      <div style={{ border: '1px solid black' }}>
        <div>Locks</div>
        {locks.map((lock, i) => (
          <div key={i}>
            amount {lock.amount} exp {lock.expiry}
          </div>
        ))}
        Total locked {totalLockedPAW}
      </div>

      <div style={{ border: '1px solid black' }}>
        Claimable fees
        {claimables.map((claimable, i) => (
          <div key={i}>
            amount {claimable.amount} token {claimable.token}
          </div>
        ))}
        {totalClaimableValue} <button onClick={handleClaimAll}>claim all</button>
      </div>

      <div style={{ border: '1px solid black' }}>
        Claimed fees
        {claimeds.map((claimed, i) => (
          <div key={i}>
            amount {claimed.amount} token {claimed.token}
          </div>
        ))}
        {totalClaimedValue}
      </div>
    </Paper>
  );
};
