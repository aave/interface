/* eslint-disable @typescript-eslint/no-explicit-any */
import { Grid, Paper } from '@mui/material';
import { Contract } from 'ethers';
import * as React from 'react';
import ManekiLoadingPaper from 'src/maneki/utils/ManekiLoadingPaper';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import MANEKI_DATA_PROVIDER_ABI from './DataABI';
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
  const [vests, setVests] = React.useState<VestEntry[]>([]);
  const [totalVestsValue, setTotalVestsValue] = React.useState(-1);
  const [locks, setLocks] = React.useState<VestEntry[]>([]);
  const [totalLocksValue, setTotalLocksValue] = React.useState(-1);
  const [claimables, setClaimables] = React.useState<Claimables[][]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const { provider, currentAccount } = useWeb3Context();

  const MULTI_FEE_ADDR = marketsData.bsc_testnet_v3.addresses.COLLECTOR as string;
  const MANEKI_DATA_PROVIDER_ADDR = marketsData.bsc_testnet_v3.addresses
    .STAKING_DATA_PROVIDER as string;

  // handle unlock action
  const handleClaimUnlock = () => {
    // create contract
    const signer = provider?.getSigner(currentAccount as string);
    const contract = new Contract(MULTI_FEE_ADDR, MULTI_FEE_ABI, signer);

    const promises = [];

    // add contract call into promise arr
    promises.push(contract.withdraw(unlockedPAW)); // withdraw unlocked paw

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
    const signer = provider?.getSigner(currentAccount as string);
    const contract = new Contract(MULTI_FEE_ADDR, MULTI_FEE_ABI, signer);

    const promises = [];

    // add contract call into promise arr
    promises.push(contract.exit(false)); // claim vested and unlocked

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
    const signer = provider?.getSigner(currentAccount as string);
    const contract = new Contract(MULTI_FEE_ADDR, MULTI_FEE_ABI, signer);

    const promises = [];

    // add contract call into promise arr
    promises.push(contract.withdrawExpiredLocks()); // claim all expired locks

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
    const signer = provider?.getSigner(currentAccount as string);
    const contract = new Contract(MULTI_FEE_ADDR, MULTI_FEE_ABI, signer);

    const promises = [];

    // add contract call into promise arr
    promises.push(contract.getReward(claimables.map((e) => e[0]))); // claims all fees

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
    if (!provider) return;
    // create contract
    const contract = new Contract(MANEKI_DATA_PROVIDER_ADDR, MANEKI_DATA_PROVIDER_ABI, provider);

    const promises = [];

    // add contract call into promise arr
    promises.push(contract.getUnlockedPaw(currentAccount)); // unlockedpaw
    promises.push(contract.getVestingPaw(currentAccount)); // vestedpaw
    promises.push(contract.getEarlyExitPenalty(currentAccount)); // exit penalty
    promises.push(contract.getExpiredLockedPaw(currentAccount)); // expired locked paw
    promises.push(contract.getTotalPawLocked(currentAccount)); // total locked paw
    promises.push(contract.getClaimableRewardsUsdBalance(currentAccount)); // total claimable value
    promises.push(contract.getVestingScheduleArray(currentAccount)); // vests
    promises.push(contract.getLockScheduleArray(currentAccount)); // locks
    promises.push(contract.getClaimableRewards(currentAccount)); // claimables
    promises.push(contract.getTotalPawLockedValue(currentAccount)); // locked value
    promises.push(contract.getTotalPawVestingValue(currentAccount)); // vesting value

    // call promise all and get data
    Promise.all(promises)
      .then((data: (NumReturn | VestEntry[] | Claimables[][])[]) => {
        // dev change data setting logic here

        setUnlockedPAW(parseInt((data[0] as NumReturn)._hex, 16));
        setVestedPAW(parseInt((data[1] as NumReturn)._hex, 16));
        setExitPenalty(parseInt((data[2] as NumReturn)._hex, 16));
        setExpiredLockedPAW(parseInt((data[3] as NumReturn)._hex, 16));
        setTotalLockedPAW(parseInt((data[4] as NumReturn)._hex, 16));
        setTotalClaimableValue(parseInt((data[5] as NumReturn)._hex, 16));
        setVests(data[6] as VestEntry[]);
        setLocks(data[7] as VestEntry[]);
        setClaimables(data[8] as Claimables[][]);
        setTotalLocksValue(parseInt((data[9] as NumReturn)._hex, 16));
        setTotalVestsValue(parseInt((data[10] as NumReturn)._hex, 16));
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [provider]);

  if (loading) return <ManekiLoadingPaper description="Loading..." withCircle />;

  return (
    <>
      <Grid md={9} xs={12} sx={{ px: '12px' }}>
        <Paper>
          <div>main actions</div>
          <div style={{ border: '1px solid black' }}>
            Unlocked paw {unlockedPAW}
            <button onClick={handleClaimUnlock}>Claim</button>
          </div>
          <div style={{ border: '1px solid black' }}>
            Vested paw {vestedPAW} penalty {exitPenalty}
            <div>
              Claim all <button onClick={handleClaimAllVest}>Claim</button>
            </div>
          </div>

          <div style={{ border: '1px solid black' }}>
            Expired locked paw {expiredLockedPAW}{' '}
            <button onClick={handleClaimExpired}>Claim</button>
          </div>

          <div style={{ border: '1px solid black' }}>
            <div>Vests</div>
            {vests.map((vest, i) => (
              <div key={i}>
                amount {vest.amount} exp {vest.expiry}
              </div>
            ))}
            Total vested {totalVestsValue}
          </div>

          <div style={{ border: '1px solid black' }}>
            <div>Locks</div>
            {locks.map((lock, i) => (
              <div key={i}>
                amount {lock.amount} exp {lock.expiry}
              </div>
            ))}
            Total locked {totalLockedPAW} value {totalLocksValue}
          </div>

          <div style={{ border: '1px solid black' }}>
            Claimable fees
            {claimables.map((claimable, i) => (
              <div key={i}>
                amount {(claimable as Claimables[])[0]} token{' '}
                {parseInt(((claimable as Claimables[])[1] as unknown as NumReturn)._hex, 16)}
              </div>
            ))}
            {totalClaimableValue} <button onClick={handleClaimAll}>claim all</button>
          </div>
        </Paper>
      </Grid>
    </>
  );
};
