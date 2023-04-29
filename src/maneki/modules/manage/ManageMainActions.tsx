/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { BigNumber, Contract } from 'ethers';
import * as React from 'react';
import ManekiLoadingPaper from 'src/maneki/utils/ManekiLoadingPaper';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import ManageMainPaper from './components/ManageMainPaper';
import ManageMainPrimaryWrapper from './components/ManageMainPrimaryWrapper';
import MANEKI_DATA_PROVIDER_ABI from './DataABI';
import MULTI_FEE_ABI from './MultiFeeABI';

// interface NumReturn {
//   _hex: string;
//   _isBigNumber: boolean;
// }

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
  const [vests, setVests] = React.useState<VestEntry[][]>([]);
  const [totalVestsValue, setTotalVestsValue] = React.useState(-1);
  const [locks, setLocks] = React.useState<VestEntry[][]>([]);
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
      .then((data: (BigNumber | VestEntry[][] | Claimables[][])[]) => {
        // dev change data setting logic here
        {
          /** Need to convert to string */
        }
        setUnlockedPAW(parseInt((data[0] as BigNumber)._hex, 16));
        setVestedPAW(parseInt((data[1] as BigNumber)._hex, 16));
        setExitPenalty(parseInt((data[2] as BigNumber)._hex, 16));
        setExpiredLockedPAW(parseInt((data[3] as BigNumber)._hex, 16));
        setTotalLockedPAW(parseInt((data[4] as BigNumber)._hex, 16));
        setTotalClaimableValue(parseInt((data[5] as BigNumber)._hex, 16));
        setVests(data[6] as VestEntry[][]);
        setLocks(data[7] as VestEntry[][]);
        setClaimables(data[8] as Claimables[][]);
        setTotalLocksValue(parseInt((data[9] as BigNumber)._hex, 16));
        setTotalVestsValue(parseInt((data[10] as BigNumber)._hex, 16));
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [provider]);

  if (loading) return <ManekiLoadingPaper description="Loading..." withCircle />;

  return (
    <>
      <Box sx={{ minWidth: '70%' }}>
        <ManageMainPaper>
          <ManageMainPrimaryWrapper
            borderBottom
            leftComponent={
              <>
                <Typography variant="h4" fontWeight={700}>
                  Unlock PAW{' '}
                </Typography>
                <Typography sx={{ width: '90%' }}>Staked PAW and expired PAW vests</Typography>
              </>
            }
            rightComponent={
              <>
                <Typography>{unlockedPAW} PAW</Typography>
                <Button
                  variant="contained"
                  onClick={handleClaimUnlock}
                  sx={{ padding: '8px 24px' }}
                >
                  Claim
                </Button>
              </>
            }
          />
          <ManageMainPrimaryWrapper
            borderBottom
            leftComponent={
              <>
                <Typography variant="h4" fontWeight={700}>
                  Vested PAW
                </Typography>
                <Typography sx={{ width: '90%' }}>
                  PAW that can be claimed with a{' '}
                  <Typography component={'span'} color="error.light">
                    50% penalty
                  </Typography>
                </Typography>
              </>
            }
            rightComponent={
              <Typography
                sx={{
                  width: '50%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {vestedPAW}{' '}
              </Typography>
            }
          />
          <ManageMainPrimaryWrapper
            borderBottom
            leftComponent={
              <>
                <Typography variant="h4" fontWeight={700}>
                  Claim all of the above
                </Typography>
                <Typography sx={{ width: '90%' }}>
                  Early Exit Penalty:{' '}
                  <Typography component="span" color={'error.light'}>
                    {exitPenalty} PAW
                  </Typography>
                </Typography>
              </>
            }
            rightComponent={
              <>
                <Typography>{''}</Typography>
                <Button
                  onClick={handleClaimAllVest}
                  variant="contained"
                  sx={{ padding: '8px 24px' }}
                >
                  Claim
                </Button>
              </>
            }
          />
          <ManageMainPrimaryWrapper
            leftComponent={
              <>
                <Typography variant="h4" fontWeight={700}>
                  Expired Locked PAW
                </Typography>
                <Typography sx={{ width: '90%' }}>
                  PAW locks that have exceeded the 3 month lock period and are now withdrawable.
                </Typography>
              </>
            }
            rightComponent={
              <>
                <Typography>{expiredLockedPAW} PAW</Typography>
                <Button
                  onClick={handleClaimExpired}
                  variant="contained"
                  sx={{ padding: '8px 24px' }}
                >
                  Claim
                </Button>
              </>
            }
          />
        </ManageMainPaper>
        <ManageMainPaper>
          <Typography variant={'h3'}>PAW Vests</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Amount</TableCell>
                  <TableCell>Expiry</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vests.map((vest, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      {BigNumber.from(((vest as VestEntry[])[0] as unknown as BigNumber)._hex)}
                    </TableCell>
                    <TableCell>
                      {BigNumber.from(((vest as VestEntry[])[1] as unknown as BigNumber)._hex)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography>Total vested: {totalVestsValue}</Typography>
        </ManageMainPaper>
        <ManageMainPaper>
          <Typography variant={'h3'}>PAW Locks</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Amount</TableCell>
                  <TableCell>Expiry</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locks.map((lock, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      {parseInt(((lock as VestEntry[])[0] as unknown as BigNumber)._hex, 16)}
                    </TableCell>
                    <TableCell>
                      {/** Convert Unix Timestamp to DateTime */}
                      {parseInt(((lock as VestEntry[])[1] as unknown as BigNumber)._hex, 16)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/** Value in Uint256 */}
          <Typography>Total locked: {totalLockedPAW}</Typography>
          {/** Value in USD */}
          <Typography>value: {totalLocksValue}</Typography>
        </ManageMainPaper>
        <ManageMainPaper>
          <Typography variant={'h3'}>Claimable fees</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tokens</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claimables.map((claimable, i) => (
                  <TableRow key={i}>
                    {/** Map this to svg icon and respective coin */}
                    <TableCell>{(claimable as Claimables[])[0]}</TableCell>
                    <TableCell>
                      {/** Map this to string of uint256 */}
                      {parseInt(((claimable as Claimables[])[1] as unknown as BigNumber)._hex, 16)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Typography>Total Value: {totalClaimableValue}</Typography>
            <Button
              onClick={handleClaimAll}
              // sx={(theme) => ({ border: `1px solid ${theme.palette.primary.main}` })}
              variant="contained"
              sx={{ padding: '8px 24px' }}
            >
              Claim All
            </Button>
          </Box>
        </ManageMainPaper>
      </Box>
    </>
  );
};
