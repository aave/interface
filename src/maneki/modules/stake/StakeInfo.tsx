/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper } from '@mui/material';
import { Contract } from 'ethers';
import * as React from 'react';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import { useStakingContext } from '../../hooks/staking-data-provider/StakingDataProvider';
import MULTI_FEE_ABI from './MultiFeeABI';

interface NumReturn {
  _hex: string;
  _isBigNumber: boolean;
}

export const StakeInfo = () => {
  const { stakedPAW } = useStakingContext();
  const [vestedPAW, setVestedPAW] = React.useState<number>(-1);
  const [stakingAPR, setStakingAPR] = React.useState<number>(-1);
  const [LPPrice, setLPPrice] = React.useState<number>(-1);
  const [LPStaked, setLPStaked] = React.useState<number>(-1);
  const [totalDailyRewards, setTotalDailyRewards] = React.useState<number>(-1);
  const [loading, setLoading] = React.useState<boolean>(true);

  const { provider } = useWeb3Context();

  const MULTI_FEE_ADDR = marketsData.bsc_testnet_v3.addresses.MERKLE_DIST as string;

  // handle unstake action
  const handleUnstake = () => {
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

  // handle vest action
  const handleVest = () => {
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

    // call promise all and get data
    Promise.all(promises)
      .then((data: NumReturn[]) => {
        // dev change data setting logic here
        setVestedPAW(parseInt(data[0]._hex, 16));
        setStakingAPR(parseInt(data[1]._hex, 16));
        setLPPrice(parseInt(data[2]._hex, 16));
        setLPStaked(parseInt(data[3]._hex, 16));
        setTotalDailyRewards(parseInt(data[4]._hex, 16));
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, []);

  if (loading) return <Paper> Loading.. </Paper>;

  return (
    <Paper>
      <div>stake info</div>
      <div>
        Your staked PAW {stakedPAW} <button onClick={handleUnstake}>Unstake</button>
      </div>
      <div>
        Your vested PAW {vestedPAW} <button onClick={handleVest}>Vest</button>
      </div>
      <div>stakingAPR {stakingAPR}</div>
      <div>LPPrice {LPPrice}</div>
      <div>LPStaked {LPStaked}</div>
      <div>totalDailyRewards {totalDailyRewards}</div>
      <div>totalWeeklyRewards {totalDailyRewards * 7}</div>
    </Paper>
  );
};
