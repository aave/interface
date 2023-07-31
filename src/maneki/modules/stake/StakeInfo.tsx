/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper } from '@mui/material';
import { Contract } from 'ethers';
import * as React from 'react';
import ManekiLoadingPaper from 'src/maneki/components/ManekiLoadingPaper';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import { useStakingContext } from '../../hooks/staking-data-provider/StakingDataProvider';
import MANEKI_DATA_PROVIDER_ABI from './DataABI';
import MASTER_CHEF_ABI from './MasterChefABI';

interface NumReturn {
  _hex: string;
  _isBigNumber: boolean;
}

export const StakeInfo = () => {
  const { stakedPAW } = useStakingContext();
  const [vestablePAW, setvestablePAW] = React.useState<number>(-1);
  const [stakingAPR, setStakingAPR] = React.useState<number>(-1);
  const [LPPrice, setLPPrice] = React.useState<number>(-1);
  const [LPStaked, setLPStaked] = React.useState<number>(-1);
  const [totalDailyRewards, setTotalDailyRewards] = React.useState<number>(-1);
  const [loading, setLoading] = React.useState<boolean>(true);

  const { provider, currentAccount } = useWeb3Context();

  // eslint-disable-next-line prettier/prettier
  const MANEKI_DATA_PROVIDER_ADDR = marketsData.arbitrum_mainnet_v3.addresses
    .STAKING_DATA_PROVIDER as string;

  const MASTER_CHEF_ADDR = marketsData.arbitrum_mainnet_v3.addresses.MASTER_CHEF as string;

  // handle unstake action
  const handleUnstake = () => {
    // create contract
    const signer = provider?.getSigner(currentAccount as string);
    const contract = new Contract(MASTER_CHEF_ADDR, MASTER_CHEF_ABI, signer);

    const promises = [];

    // add contract call into promise arr
    promises.push(contract.withdraw(marketsData.arbitrum_mainnet_v3.addresses.LP_TOKEN, LPStaked)); // unstake action

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
    const signer = provider?.getSigner(currentAccount as string);
    const contract = new Contract(MASTER_CHEF_ADDR, MASTER_CHEF_ABI, signer);

    const promises = [];

    // add contract call into promise arr
    promises.push(
      contract.claim(currentAccount, [marketsData.arbitrum_mainnet_v3.addresses.LP_TOKEN])
    ); // vest action

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
    const contract = new Contract(MANEKI_DATA_PROVIDER_ADDR, MANEKI_DATA_PROVIDER_ABI, provider);
    const contract2 = new Contract(MASTER_CHEF_ADDR, MASTER_CHEF_ABI, provider);

    const promises = [];

    // add contract call into promise arr
    promises.push(
      contract2.claimableReward(currentAccount, [
        marketsData.arbitrum_mainnet_v3.addresses.LP_TOKEN,
      ])
    ); // vestable paw
    promises.push(contract.getStakingAPR()); // stakingapr
    promises.push(contract.getLpPrice()); // lpprice
    promises.push(contract.getLpStaked()); // lpstaked
    promises.push(contract.getTotalDailyRewards()); // totaldailyrewards

    // call promise all and get data
    Promise.all(promises)
      .then((data: (NumReturn | NumReturn[])[]) => {
        // dev change data setting logic here
        setvestablePAW(parseInt((data[0] as NumReturn[])[0]._hex, 16));
        setStakingAPR(parseInt((data[1] as NumReturn)._hex, 16));
        setLPPrice(parseInt((data[2] as NumReturn)._hex, 16));
        setLPStaked(parseInt((data[3] as NumReturn)._hex, 16));
        setTotalDailyRewards(parseInt((data[4] as NumReturn)._hex, 16));
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, []);

  if (loading) return <ManekiLoadingPaper description="Loading..." />;

  return (
    <Paper>
      <div>stake info</div>
      <div>
        Your staked PAW {stakedPAW} price {stakedPAW * LPPrice}{' '}
        <button onClick={handleUnstake}>Unstake</button>
      </div>
      <div>
        Your vestable PAW {vestablePAW} <button onClick={handleVest}>Vest</button>
      </div>
      <div>stakingAPR {stakingAPR}</div>
      <div>LPPrice {LPPrice}</div>
      <div>LPStaked {LPStaked}</div>
      <div>totalDailyRewards {totalDailyRewards}</div>
      <div>totalWeeklyRewards {totalDailyRewards * 7}</div>
    </Paper>
  );
};
