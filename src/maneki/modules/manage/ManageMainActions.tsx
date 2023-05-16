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
import { BigNumber, Contract, utils } from 'ethers';
import Image from 'next/image';
import * as React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useManageContext } from 'src/maneki/hooks/manage-data-provider/ManageDataProvider';
import ManekiLoadingPaper from 'src/maneki/utils/ManekiLoadingPaper';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import ManageMainPaper from './components/ManageMainPaper';
import ManageMainPrimaryWrapper from './components/ManageMainPrimaryWrapper';
import MANEKI_DATA_PROVIDER_ABI from './DataABI';
// import MULTI_FEE_ABI from './MultiFeeABI';
import {
  Claimables,
  ClaimablesTuple,
  convertClaimables,
  convertUnixToDate,
  convertVestEntry,
  VestEntry,
  VestEntryTuple,
} from './utils/manageActionHelper';
import { tokenImageMatching } from './utils/tokenMatching';

export const ManageMainActions = () => {
  const [unlockedPAW, setUnlockedPAW] = React.useState(BigNumber.from(-1)); // Convert from BigNumber to 18 decimals
  const [vestedPAW, setVestedPAW] = React.useState(BigNumber.from(-1)); // Convert from BigNumber to 18 decimals
  const [exitPenalty, setExitPenalty] = React.useState(BigNumber.from(-1)); // Convert from BigNumber to 18 decimals
  const [expiredLockedPAW, setExpiredLockedPAW] = React.useState(BigNumber.from(-1)); // Convert from BigNumber to 18 decimals
  const [totalLockedPAW, setTotalLockedPAW] = React.useState(BigNumber.from(-1)); // Convert from BigNumber to 18 decimals
  const [totalClaimableValue, setTotalClaimableValue] = React.useState(BigNumber.from(-1));
  const [vests, setVests] = React.useState<VestEntry[]>([]);
  const [totalVestsValue, setTotalVestsValue] = React.useState(BigNumber.from(-1));
  const [locks, setLocks] = React.useState<VestEntry[]>([]);
  const [totalLocksValue, setTotalLocksValue] = React.useState(BigNumber.from(-1));
  const [claimables, setClaimables] = React.useState<Claimables[]>([]);
  const { mainActionsLoading, setMainActionsLoading } = useManageContext();
  const { provider, currentAccount } = useWeb3Context();
  const { openManage } = useModalContext();
  // const MULTI_FEE_ADDR = marketsData.bsc_testnet_v3.addresses.COLLECTOR as string;
  const MANEKI_DATA_PROVIDER_ADDR = marketsData.bsc_testnet_v3.addresses
    .STAKING_DATA_PROVIDER as string;

  // handle unlock action
  const handleClaimUnlock = () => {
    if (unlockedPAW.isZero()) return;
    openManage(unlockedPAW.toString(), ModalType.ManageClaimUnlock);
  };

  // handle claim all vest action
  const handleClaimAllVest = () => {
    if (totalVestsValue.isZero()) return;
    openManage(totalVestsValue.toString(), ModalType.ManageClaimAllVest);
  };

  // claim expired
  const handleClaimExpired = () => {
    if (expiredLockedPAW.isZero()) return;
    openManage(expiredLockedPAW.toString(), ModalType.ManageClaimExpired);
  };

  // claim all
  const handleClaimAll = () => {
    openManage('0', ModalType.ManageClaimAll);
  };

  React.useEffect(() => {
    if (!provider && !mainActionsLoading) return;
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
      .then((data: (BigNumber | VestEntryTuple[] | ClaimablesTuple[])[]) => {
        // dev change data setting logic here
        setUnlockedPAW(data[0] as BigNumber); // 18 Decimal percision
        setVestedPAW(data[1] as BigNumber); // 18 Decimal percision
        setExitPenalty(data[2] as BigNumber); // 18 Decimal percision
        setExpiredLockedPAW(data[3] as BigNumber); // 18 Decimal percision (Funciton empty)
        setTotalLockedPAW(data[4] as BigNumber); // 18 Decimal percision
        setTotalClaimableValue(data[5] as BigNumber); // 8 Decimal percision
        setVests(convertVestEntry(data[6] as VestEntryTuple[]));
        setLocks(convertVestEntry(data[7] as VestEntryTuple[]));
        setClaimables(convertClaimables(data[8] as ClaimablesTuple[]));
        setTotalLocksValue(data[9] as BigNumber); // 8 Decimal percision
        setTotalVestsValue(data[10] as BigNumber); // 8 Decimal percision
        setMainActionsLoading(false);
      })
      .catch((e) => console.error(e));
  }, [provider, mainActionsLoading]);

  if (mainActionsLoading) return <ManekiLoadingPaper description="Loading..." withCircle />;

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
                <Typography>{utils.formatUnits(unlockedPAW, 18)} PAW</Typography>
                <Button
                  variant="contained"
                  onClick={handleClaimUnlock}
                  sx={{ padding: '8px 24px' }}
                  disabled={unlockedPAW.isZero() ? true : false}
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
                {utils.formatUnits(vestedPAW, 18)}{' '}
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
                    {utils.formatUnits(exitPenalty, 18)} PAW
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
                  disabled={totalVestsValue.isZero() ? true : false}
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
                <Typography>{utils.formatUnits(expiredLockedPAW, 18)} PAW</Typography>
                <Button
                  onClick={handleClaimExpired}
                  variant="contained"
                  sx={{ padding: '8px 24px' }}
                  disabled={expiredLockedPAW.isZero() ? true : false}
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
                    <TableCell>{utils.formatUnits(vest.amount, 18)}</TableCell>
                    <TableCell>{convertUnixToDate(vest.expiry.toNumber() * 1000)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography>
            Total vested: {(totalVestsValue.toNumber() / 100_000_000).toFixed(2)}
          </Typography>
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
                    <TableCell>{utils.formatUnits(lock.amount, 18)}</TableCell>
                    <TableCell>
                      {/** Convert Unix Timestamp to DateTime */}
                      {convertUnixToDate(lock.expiry.toNumber() * 1000)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/** Value in Uint256 */}
          <Typography>Total locked: {utils.formatUnits(totalLockedPAW.toString(), 18)}</Typography>
          {/** Value in USD */}
          <Typography>Value: {(totalLocksValue.toNumber() / 100_000_000).toFixed(2)}</Typography>
        </ManageMainPaper>
        <ManageMainPaper>
          <Typography variant={'h3'}>Claimable fees</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '50%' }}>Tokens</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claimables.map((claimable, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <Image
                        alt={`token image for ${tokenImageMatching[claimable.token]}`}
                        src={`/icons/tokens/${tokenImageMatching[claimable.token]}.svg`}
                        width={24}
                        height={24}
                      />
                      <Typography>{`m${tokenImageMatching[
                        claimable.token
                      ].toUpperCase()}`}</Typography>
                    </TableCell>
                    <TableCell>
                      {/** Map this to string of uint256 */}
                      {utils.formatUnits(claimable.amount.toString(), 18)}
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
            <Typography>
              Total Value: {(totalClaimableValue.toNumber() / 100_000_000).toFixed(2)}
            </Typography>
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
