/* eslint-disable @typescript-eslint/no-explicit-any */
import AddModeratorOutlinedIcon from '@mui/icons-material/AddModeratorOutlined';
import EnhancedEncryptionOutlinedIcon from '@mui/icons-material/EnhancedEncryptionOutlined';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { Contract } from 'ethers';
import * as React from 'react';
import ManekiLoadingPaper from 'src/maneki/utils/ManekiLoadingPaper';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import { useManageContext } from '../../hooks/manage-data-provider/ManageDataProvider';
import MANEKI_DATA_PROVIDER_ABI from './DataABI';
import MULTI_FEE_ABI from './MultiFeeABI';

interface NumReturn {
  _hex: string;
  _isBigNumber: boolean;
}

export const ManageQuickActions = () => {
  const { balancePAW, setBalancePAW } = useManageContext();
  const [stakingAPR, setStakingAPR] = React.useState<number>(-1);
  const [lockingAPR, setLockingAPR] = React.useState<number>(-1);
  const [amountToStake, setAmountToStake] = React.useState<number>(0);
  const [amountToLock, setAmountToLock] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const { provider, currentAccount } = useWeb3Context();

  const MULTI_FEE_ADDR = marketsData.bsc_testnet_v3.addresses.COLLECTOR as string;
  const MANEKI_DATA_PROVIDER_ADDR = marketsData.bsc_testnet_v3.addresses
    .STAKING_DATA_PROVIDER as string;

  // handle lock action
  const handleLock = () => {
    // create contract
    const signer = provider?.getSigner(currentAccount as string);
    const contract = new Contract(MULTI_FEE_ADDR, MULTI_FEE_ABI, signer);

    const promises = [];

    // add contract call into promise arr
    promises.push(contract.stake(amountToLock, true)); // lock

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

  // handle stake action
  const handleStake = () => {
    // create contract
    const signer = provider?.getSigner(currentAccount as string);
    const contract = new Contract(MULTI_FEE_ADDR, MULTI_FEE_ABI, signer);

    const promises = [];

    // add contract call into promise arr
    promises.push(contract.stake(amountToLock, false)); // stake

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
    // create contracts
    const contract = new Contract(MANEKI_DATA_PROVIDER_ADDR, MANEKI_DATA_PROVIDER_ABI, provider);
    console.log(contract);
    const promises = [];

    // add contract call into promise arr
    promises.push(contract.getTotalBalance(currentAccount)); // balance
    promises.push(contract.getStakingAPR()); // staking apr
    promises.push(contract.getLockingAPR()); // locking apr

    // call promise all and get data
    Promise.all(promises)
      .then((data: NumReturn[]) => {
        // dev change data setting logic here
        console.log('data', data);
        setBalancePAW(parseInt(data[0]._hex, 16));
        setStakingAPR(parseInt(data[1]._hex, 16));
        setLockingAPR(parseInt(data[2]._hex, 16));

        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, []);

  if (loading) return <ManekiLoadingPaper description="Loading..." withCircle />;

  return (
    <Grid md={3} xs={12} sx={{ px: '16px', gap: '32px' }} container>
      {/* Stake */}
      <Paper
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '24px',
          boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 3px 0px',
          borderRadius: '14px',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <AddModeratorOutlinedIcon sx={{ transform: 'scale(1.5)' }} />
            <Typography variant="h2" fontWeight={'800'}>
              Stake
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: '8px' }}>
            <Typography>APR </Typography>
            <Typography>{(stakingAPR / 100000000).toFixed(2)} %</Typography>
          </Box>
        </Box>
        <Typography>Stake PAW and earn platform fees with no lockup period.</Typography>
        <Box>
          <Typography>Waller balance </Typography>
          <Typography>{balancePAW}</Typography>
        </Box>
        <Box>
          <input
            value={amountToStake}
            onChange={(e) => setAmountToStake(parseInt(e.target.value))}
            type="number"
            max={balancePAW}
          />
          <button onClick={handleStake}>stake</button>
        </Box>
      </Paper>
      <Paper
        style={{
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 3px 0px',
          padding: '24px',
          gap: '12px',
          borderRadius: '14px',
        }}
      >
        {/* Lock */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <EnhancedEncryptionOutlinedIcon sx={{ transform: 'scale(1.5)' }} />
            <Typography variant="h2" fontWeight="800">
              Lock
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: '8px' }}>
            <Typography>APR</Typography>
            <Typography>{(lockingAPR / 100000000).toFixed(2)} %</Typography>
          </Box>
        </Box>
        <Typography>Lock PAW and earn platform fees and penalty fees in unlocked PAW.</Typography>
        <Typography>
          Locked PAW is subject to a three month lock and will continue to earn fees after the locks
          expire if you do not withdraw.
        </Typography>
        <Box>
          <Typography>Balance</Typography>
          <Typography>{balancePAW}</Typography>
        </Box>
        <Box>
          <input
            value={amountToLock}
            onChange={(e) => setAmountToLock(parseInt(e.target.value))}
            type="number"
            max={balancePAW}
          />
          <button onClick={handleLock}>lock</button>
        </Box>
      </Paper>
    </Grid>
  );
};
