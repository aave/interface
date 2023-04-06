/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Paper } from '@mui/material';
import { Contract } from 'ethers';
import * as React from 'react';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import MANEKI_DATA_PROVIDER_ABI from './DataABI';
import MULTI_FEE_ABI from './MultiFeeABI';

interface NumReturn {
  _hex: string;
  _isBigNumber: boolean;
}

export const StakeMain = () => {
  const [maxvalue, setMaxvalue] = React.useState<number>(-1);
  const [amountToStake, setAmountToStake] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const { provider, currentAccount } = useWeb3Context();

  const MULTI_FEE_ADDR = marketsData.bsc_testnet_v3.addresses.COLLECTOR as string;
  // eslint-disable-next-line prettier/prettier
  const MANEKI_DATA_PROVIDER_ADDR = marketsData.bsc_testnet_v3.addresses
    .STAKING_DATA_PROVIDER as string;

  // handle stake action
  const handleStake = () => {
    // create contract
    const contract = new Contract(MULTI_FEE_ADDR, MULTI_FEE_ABI, provider);

    const promises = [];

    // add contract call into promise arr
    promises.push(contract.stake(amountToStake, false)); // stake action

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

    const promises = [];

    // add contract call into promise arr
    promises.push(contract.getTotalBalance(currentAccount)); // balance

    // call promise all and get data
    Promise.all(promises)
      .then((data: NumReturn[]) => {
        // dev change data setting logic here
        setMaxvalue(parseInt(data[0]._hex, 16));
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, []);

  if (loading) return <Paper> Loading.. </Paper>;

  return (
    <Paper>
      <Box>Max {maxvalue}</Box>

      <input
        value={amountToStake}
        onChange={(e) => setAmountToStake(parseInt(e.target.value))}
        type="number"
        max={maxvalue}
      />
      <button onClick={handleStake}>Stake</button>
    </Paper>
  );
};
