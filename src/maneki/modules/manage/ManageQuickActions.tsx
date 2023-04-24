/* eslint-disable @typescript-eslint/no-explicit-any */
import AddModeratorOutlinedIcon from '@mui/icons-material/AddModeratorOutlined';
import EnhancedEncryptionOutlinedIcon from '@mui/icons-material/EnhancedEncryptionOutlined';
import { Box, Button, Paper, Typography } from '@mui/material';
import { BigNumber, Contract, utils } from 'ethers';
import * as React from 'react';
import NumberFormat from 'react-number-format';
import ManekiLoadingPaper from 'src/maneki/utils/ManekiLoadingPaper';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import { useManageContext } from '../../hooks/manage-data-provider/ManageDataProvider';
import MANEKI_DATA_PROVIDER_ABI from './DataABI';
import { countDecimals, toWeiString } from './ManageUtils';
import MULTI_FEE_ABI from './MultiFeeABI';
import PAW_TOKEN_ABI from './PAWTokenABI';

interface NumReturn {
  _hex: string;
  _isBigNumber: boolean;
}

interface CustomNumberFormatType {
  amountTo: string;
  setAmountTo: React.Dispatch<React.SetStateAction<string>>;
  balancePAW: string;
  style?: React.CSSProperties;
}

function CustomNumberFormat({ amountTo, setAmountTo, balancePAW, style }: CustomNumberFormatType) {
  return (
    <NumberFormat
      value={amountTo}
      thousandSeparator
      isNumericString={true}
      allowNegative={false}
      isAllowed={(values) => {
        if (countDecimals(values.value) > 18 || parseFloat(values.value) > parseFloat(balancePAW))
          return false;
        return true;
      }}
      onValueChange={(values) => {
        const countDec = countDecimals(values.value);
        if (countDec > 18) values.value = amountTo;
        setAmountTo(values.value);
      }}
      style={style}
    />
  );
}

export const ManageQuickActions = () => {
  const { balancePAW, setBalancePAW } = useManageContext();
  const [stakingAPR, setStakingAPR] = React.useState<number>(-1);
  const [lockingAPR, setLockingAPR] = React.useState<number>(-1);
  const [amountToStake, setAmountToStake] = React.useState<string>('');
  const [amountToLock, setAmountToLock] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const { provider, currentAccount } = useWeb3Context();
  console.log(provider);
  console.log(currentAccount);
  console.log(provider?.getSigner(currentAccount as string));
  const PAW_TOKEN_ADDR = marketsData.bsc_testnet_v3.addresses.PAW_TOKEN as string;
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
    promises.push(contract.stake(BigNumber.from(toWeiString(amountToLock)), true)); // lock

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
    promises.push(contract.stake(BigNumber.from(toWeiString(amountToStake)), false)); // stake

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
    const pawContract = new Contract(PAW_TOKEN_ADDR, PAW_TOKEN_ABI, provider);
    const promises = [];

    // add contract call into promise arr
    promises.push(pawContract.balanceOf(currentAccount)); // balance
    promises.push(contract.getStakingAPR()); // staking apr
    promises.push(contract.getLockingAPR()); // locking apr

    // call promise all and get data
    Promise.all(promises)
      .then((data: NumReturn[]) => {
        // dev change data setting logic here

        setBalancePAW(utils.formatUnits(data[0].toString(), 18));
        setStakingAPR(parseInt(data[1]._hex, 16));
        setLockingAPR(parseInt(data[2]._hex, 16));

        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, []);

  if (loading) return <ManekiLoadingPaper description="Loading..." withCircle />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '32px', minWidth: '30%' }}>
      {/* Stake */}
      <Paper
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '32px',
          boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 3px 0px',
          borderRadius: '14px',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: '12px' }}>
            <AddModeratorOutlinedIcon sx={{ transform: 'scale(1.3)' }} />
            <Typography variant="h3" fontWeight={'700'}>
              Stake PAW
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: '8px',
              padding: '12px',
              border: '1px solid rgb(68, 73, 92)',
              borderRadius: '12px',
              bgcolor: 'background.header',
            }}
          >
            <Typography fontWeight={600} fontSize={12}>
              APR
            </Typography>
            <Typography fontWeight={800} fontSize={16}>
              {(stakingAPR / 100000000).toFixed(2)} %
            </Typography>
          </Box>
        </Box>
        <Typography fontWeight={600} fontSize={'14px'}>
          Stake PAW and earn platform fees with no lockup period.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontSize={16} fontWeight={500}>
            Wallet Balance :
          </Typography>
          <Typography fontSize={18} fontWeight={600}>
            {balancePAW} PAW
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <CustomNumberFormat
            amountTo={amountToStake}
            setAmountTo={setAmountToStake}
            balancePAW={balancePAW}
            style={{
              padding: '12px 16px',
              border: 'solid 1px #dadada',
              fontSize: '16px',
              borderRadius: '8px',
            }}
          />
          <Button onClick={handleStake} variant="contained" sx={{ padding: '0px 24px' }}>
            Stake
          </Button>
        </Box>
      </Paper>
      <Paper
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '32px',
          boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 3px 0px',
          borderRadius: '14px',
        }}
      >
        {/* Lock */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: '12px' }}>
            <EnhancedEncryptionOutlinedIcon sx={{ transform: 'scale(1.3)' }} />
            <Typography variant="h3" fontWeight={'700'}>
              Lock PAW
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: '8px',
              padding: '12px',
              border: '1px solid rgb(68, 73, 92)',
              borderRadius: '12px',
              bgcolor: 'background.header',
            }}
          >
            <Typography fontWeight={600} fontSize={12}>
              APR
            </Typography>
            <Typography fontWeight={800} fontSize={16}>
              {(lockingAPR / 100000000).toFixed(2)} %
            </Typography>
          </Box>
        </Box>
        <Typography fontWeight={600} fontSize={'14px'}>
          Lock PAW and earn platform fees and penalty fees in unlocked PAW.
        </Typography>
        <Typography fontWeight={600} fontSize={'14px'}>
          Locked PAW is subject to a three month lock and will continue to earn fees after the locks
          expire if you do not withdraw.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontSize={16} fontWeight={500}>
            Wallet Balance :
          </Typography>
          <Typography fontSize={18} fontWeight={600}>
            {balancePAW} PAW
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <CustomNumberFormat
            amountTo={amountToLock}
            setAmountTo={setAmountToLock}
            balancePAW={balancePAW}
            style={{
              padding: '12px 16px',
              border: 'solid 1px #dadada',
              fontSize: '16px',
              borderRadius: '8px',
            }}
          />
          <Button onClick={handleLock} variant="contained" sx={{ padding: '0px 24px' }}>
            Lock
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
