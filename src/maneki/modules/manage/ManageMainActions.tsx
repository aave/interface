/* eslint-disable @typescript-eslint/no-explicit-any */
import { Trans } from '@lingui/macro';
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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { BigNumber, Contract, utils } from 'ethers';
import Image from 'next/image';
import * as React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import MANEKI_PAW_PRICE_ORACLE_ABI from 'src/maneki/abi/pawPriceOracleABI';
import MANEKI_STAKING_DATA_PROVIDER_ABI from 'src/maneki/abi/stakingDataProbiderABI';
import ManekiLoadingPaper from 'src/maneki/components/ManekiLoadingPaper';
import { useManageContext } from 'src/maneki/hooks/manage-data-provider/ManageDataProvider';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import ManageMainPaper from './components/ManageMainPaper';
import ManageMainPrimaryWrapper from './components/ManageMainPrimaryWrapper';
import {
  ClaimablesTuple,
  ClaimablesType,
  convertClaimables,
  convertUnixToDate,
  convertVestEntry,
  VestEntry,
  VestEntryTuple,
} from './utils/manageActionHelper';

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
  const [claimables, setClaimables] = React.useState<ClaimablesType[]>([]);
  const { mainActionsLoading, setMainActionsLoading } = useManageContext();
  const { provider, currentAccount } = useWeb3Context();

  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));
  const { openManage } = useModalContext();

  const MANEKI_DATA_PROVIDER_ADDR = marketsData.bsc_testnet_v3.addresses
    .STAKING_DATA_PROVIDER as string;
  const MANEKI_PAW_PRICE_ORACLE_ADDR = marketsData.bsc_testnet_v3.addresses
    .PAW_PRICE_ORACLE as string;
  // const MANEKI_PRICE_ORACLE_ADDR = marketsData.bsc_testnet_v3.addresses.PRICE_ORACLE as string;
  // handle unlock action
  const handleClaimUnlock = () => {
    if (unlockedPAW.isZero()) return;
    openManage(unlockedPAW.toString(), ModalType.ManageClaimUnlock);
  };

  // handle claim all vest action
  const handleClaimAllVest = () => {
    if (vestedPAW.isZero()) return;
    openManage(vestedPAW.sub(exitPenalty).toString(), ModalType.ManageClaimAllVest);
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
    if (!currentAccount) setMainActionsLoading(true);
    if (!provider) return;
    // create contract
    const contract = new Contract(
      MANEKI_DATA_PROVIDER_ADDR,
      MANEKI_STAKING_DATA_PROVIDER_ABI,
      provider
    );
    const pawPriceOracleContract = new Contract(
      MANEKI_PAW_PRICE_ORACLE_ADDR,
      MANEKI_PAW_PRICE_ORACLE_ABI,
      provider
    );
    const promises = [];

    // add contract call into promise arr
    promises.push(contract.getUserUnlocked(currentAccount)); //0 unlockedpaw
    promises.push(contract.getUserVesting(currentAccount)); //1 vestedpaw
    promises.push(contract.getUserEarlyExitPenalty(currentAccount)); //2 exit penalty
    promises.push(contract.getUserExpiredLocked(currentAccount)); //3 expired locked paw
    promises.push(contract.getUserLocked(currentAccount)); //4 total locked paw
    promises.push(contract.getUserTotalClaimableRewardsInUsd(currentAccount)); //5 total claimable value
    promises.push(contract.getUserVestingScheduleArray(currentAccount)); //6 vests
    promises.push(contract.getUserLockScheduleArray(currentAccount)); //7 locks
    promises.push(contract.getUserClaimableRewardsParsedFormat(currentAccount)); //8 claimables
    promises.push(contract.getUserLockedInUsd(currentAccount)); //9 locked value
    promises.push(contract.getUserVestingInUsd(currentAccount)); //10 vesting value
    promises.push(pawPriceOracleContract.latestAnswer()); //11 PAW price in USD
    // promises.push(priceOracleContract.getAssetsPrices(Object.values(addressReserveMatching))); // 12
    // call promise all and get data
    Promise.all(promises)
      .then((data: (BigNumber | VestEntryTuple[] | ClaimablesTuple[] | BigNumber[])[]) => {
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
      .catch((error) => {
        console.error(error);
        console.log('Error Fetching Data in ManageMainAction.');
      });
    //eslint-disable-next-line
  }, [currentAccount, provider, mainActionsLoading]);

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
                  <Trans>Unlock PAW </Trans>
                </Typography>
                <Typography sx={{ width: '90%' }}>
                  <Trans>Staked PAW and expired PAW vests</Trans>
                </Typography>
              </>
            }
            rightComponent={
              <>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                  }}
                >
                  {downToSM && (
                    <Typography sx={downToSM ? { fontSize: '16px', fontWeight: '500' } : {}}>
                      Amount:
                    </Typography>
                  )}
                  <FormattedNumber
                    value={utils.formatUnits(unlockedPAW, 18)}
                    symbol="PAW"
                    sx={downToSM ? { fontSize: '16px', fontWeight: '500' } : {}}
                  />
                </Box>

                <Button
                  variant="contained"
                  onClick={handleClaimUnlock}
                  sx={{
                    padding: '8px 24px',
                    width: downToSM ? '100%' : 'auto',
                    color: 'background.default',
                  }}
                  disabled={unlockedPAW.isZero() ? true : false}
                >
                  <Trans>Claim</Trans>
                </Button>
              </>
            }
          />
          <ManageMainPrimaryWrapper
            borderBottom
            leftComponent={
              <>
                <Typography variant="h4" fontWeight={700}>
                  <Trans>Vested PAW</Trans>
                </Typography>
                <Typography sx={{ width: '90%' }}>
                  <Trans>
                    PAW that can be claimed with a{' '}
                    <Typography component={'span'} color="error.light">
                      50% penalty
                    </Typography>
                  </Trans>
                </Typography>
              </>
            }
            rightComponent={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px',
                }}
              >
                {downToSM && (
                  <Typography sx={downToSM ? { fontSize: '16px', fontWeight: '500' } : {}}>
                    Amount:
                  </Typography>
                )}
                <FormattedNumber
                  value={utils.formatUnits(vestedPAW, 18)}
                  symbol="PAW"
                  sx={downToSM ? { fontSize: '16px', fontWeight: '500' } : {}}
                />
              </Box>
            }
          />
          <ManageMainPrimaryWrapper
            borderBottom
            leftComponent={
              <>
                <Typography variant="h4" fontWeight={700}>
                  <Trans>Claim all of the above</Trans>
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: '6px' }}>
                  <Typography>
                    <Trans>Early Exit Penalty: </Trans>
                  </Typography>
                  <FormattedNumber
                    color={'error.light'}
                    value={utils.formatUnits(exitPenalty, 18)}
                  />
                  <Typography color={'error.light'}>PAW</Typography>
                </Box>
              </>
            }
            rightComponent={
              <>
                <Typography>{''}</Typography>
                <Button
                  onClick={handleClaimAllVest}
                  variant="contained"
                  sx={{
                    padding: '8px 24px',
                    width: downToSM ? '100%' : 'auto',
                    color: 'background.default',
                  }}
                  disabled={totalVestsValue.isZero() ? true : false}
                >
                  <Trans>Claim</Trans>
                </Button>
              </>
            }
          />
          <ManageMainPrimaryWrapper
            leftComponent={
              <>
                <Typography variant="h4" fontWeight={700}>
                  <Trans>Expired Locked PAW</Trans>
                </Typography>
                <Typography sx={{ width: '90%' }}>
                  <Trans>
                    PAW locks that have exceeded the 3 month lock period and are now withdrawable.
                  </Trans>
                </Typography>
              </>
            }
            rightComponent={
              <>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                  }}
                >
                  {downToSM && (
                    <Typography sx={downToSM ? { fontSize: '16px', fontWeight: '500' } : {}}>
                      Amount:
                    </Typography>
                  )}
                  <FormattedNumber
                    value={utils.formatUnits(expiredLockedPAW, 18)}
                    symbol="PAW"
                    sx={downToSM ? { fontSize: '16px', fontWeight: '500' } : {}}
                  />
                </Box>
                <Button
                  onClick={handleClaimExpired}
                  variant="contained"
                  sx={{
                    padding: '8px 24px',
                    width: downToSM ? '100%' : 'auto',
                    color: 'background.default',
                  }}
                  disabled={expiredLockedPAW.isZero() ? true : false}
                >
                  <Trans>Claim</Trans>
                </Button>
              </>
            }
          />
        </ManageMainPaper>
        <ManageMainPaper>
          <Typography variant={'h3'}>
            <Trans>PAW Vests</Trans>
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '40%' }}>
                    <Trans>Amount</Trans> (PAW)
                  </TableCell>
                  <TableCell>
                    <Trans>Expiry</Trans>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vests.map((vest, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ pl: '30px' }}>
                      <FormattedNumber value={utils.formatUnits(vest.amount, 18)} />
                    </TableCell>
                    <TableCell>{convertUnixToDate(vest.expiry.toNumber() * 1000)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TotalValueDisplay
            title={<Trans>Total Vested</Trans>}
            value={utils.formatUnits(totalVestsValue, 8)}
            symbol=" USD"
          />
        </ManageMainPaper>
        <ManageMainPaper>
          <Typography variant={'h3'}>
            <Trans>PAW Locks</Trans>
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '40%' }}>
                    <Trans>Amount</Trans> (PAW)
                  </TableCell>
                  <TableCell>
                    <Trans>Expiry</Trans>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locks.map((lock, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ pl: '30px' }}>
                      <FormattedNumber value={utils.formatUnits(lock.amount, 18)} />
                    </TableCell>
                    <TableCell>{convertUnixToDate(lock.expiry.toNumber() * 1000)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/** Value in Uint256 */}
          <TotalValueDisplay
            title={<Trans>Total Locked</Trans>}
            value={utils.formatUnits(totalLockedPAW, 18)}
            symbol="PAW"
          />
          {/** Value in USD */}
          <TotalValueDisplay
            title={<Trans>Total Value</Trans>}
            value={utils.formatUnits(totalLocksValue, 8)}
            symbol=" USD"
          />
        </ManageMainPaper>
        <ManageMainPaper>
          <Typography variant={'h3'}>
            <Trans>Claimable fees</Trans>
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '40%' }}>
                    <Trans>Tokens</Trans>
                  </TableCell>
                  <TableCell>
                    <Trans>Amount</Trans>
                  </TableCell>
                  <TableCell>Value (USD)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claimables.map((claimable, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <Image
                        alt={`token image for ${claimable.tokenSymbol}`}
                        src={`/icons/tokens/${claimable.tokenSymbol}.svg`}
                        width={24}
                        height={24}
                      />
                      <Typography>{`m${claimable.tokenSymbol.toUpperCase()}`}</Typography>
                    </TableCell>
                    <TableCell>
                      <FormattedNumber value={utils.formatUnits(claimable.amount, 18)} />
                    </TableCell>
                    <TableCell>
                      <FormattedNumber
                        value={utils.formatUnits(claimable.value, 8)}
                        symbol="USD"
                        symbolsColor={theme.palette.text.secondary}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            sx={{
              display: 'flex',
              flexDirection: downToSM ? 'column' : 'row',
              justifyContent: 'space-between',
              gap: downToSM ? '8px' : 'auto',
            }}
          >
            <TotalValueDisplay
              title={<Trans>Total Value</Trans>}
              value={utils.formatUnits(totalClaimableValue, 8)}
              symbol=" USD"
            />
            <Button
              onClick={handleClaimAll}
              variant="contained"
              sx={{ padding: '8px 24px', color: 'background.default' }}
            >
              <Trans>Claim All</Trans>
            </Button>
          </Box>
        </ManageMainPaper>
      </Box>
    </>
  );
};

interface TotalValueDisplayProps {
  title: React.ReactNode;
  value: string | number;
  symbol: string;
}

function TotalValueDisplay({ title, value, symbol }: TotalValueDisplayProps) {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Typography>{title}:</Typography>
      <FormattedNumber value={value} symbol={symbol} symbolsColor={theme.palette.text.secondary} />
    </Box>
  );
}
