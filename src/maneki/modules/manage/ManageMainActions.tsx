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
import MANEKI_PRICE_ORACLE_ABI from 'src/maneki/abi/priceOracleABI';
import { useManageContext } from 'src/maneki/hooks/manage-data-provider/ManageDataProvider';
import ManekiLoadingPaper from 'src/maneki/utils/ManekiLoadingPaper';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import ManageMainPaper from './components/ManageMainPaper';
import ManageMainPrimaryWrapper from './components/ManageMainPrimaryWrapper';
import MANEKI_DATA_PROVIDER_ABI from './DataABI';

import {
  Claimables,
  ClaimablesTuple,
  convertClaimables,
  convertUnixToDate,
  convertVestEntry,
  PriceOracleType,
  VestEntry,
  VestEntryTuple,
} from './utils/manageActionHelper';
import { addressReserveMatching, addressSymbolMatching } from './utils/tokenMatching';

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
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));
  const { openManage } = useModalContext();

  const MANEKI_DATA_PROVIDER_ADDR = marketsData.bsc_testnet_v3.addresses
    .STAKING_DATA_PROVIDER as string;
  const MANEKI_PAW_PRICE_ORACLE_ADDR = marketsData.bsc_testnet_v3.addresses
    .PAW_PRICE_ORACLE as string;
  const MANEKI_PRICE_ORACLE_ADDR = marketsData.bsc_testnet_v3.addresses.PRICE_ORACLE as string;
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
    if (!currentAccount) setMainActionsLoading(true);
    if (!provider) return;
    // create contract
    const contract = new Contract(MANEKI_DATA_PROVIDER_ADDR, MANEKI_DATA_PROVIDER_ABI, provider);
    const pawPriceOracleContract = new Contract(
      MANEKI_PAW_PRICE_ORACLE_ADDR,
      MANEKI_PAW_PRICE_ORACLE_ABI,
      provider
    );
    const priceOracleContract = new Contract(
      MANEKI_PRICE_ORACLE_ADDR,
      MANEKI_PRICE_ORACLE_ABI,
      provider
    );
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
    promises.push(pawPriceOracleContract.latestAnswer()); // PAW price in USD
    promises.push(priceOracleContract.getAssetsPrices(Object.values(addressReserveMatching)));
    // call promise all and get data
    Promise.all(promises)
      .then((data: (BigNumber | VestEntryTuple[] | ClaimablesTuple[] | BigNumber[])[]) => {
        // dev change data setting logic here
        const priceOracleObj: PriceOracleType | undefined = {};
        const keys = Object.keys(addressSymbolMatching);
        setUnlockedPAW(data[0] as BigNumber); // 18 Decimal percision
        setVestedPAW(data[1] as BigNumber); // 18 Decimal percision
        setExitPenalty(data[2] as BigNumber); // 18 Decimal percision
        setExpiredLockedPAW(data[3] as BigNumber); // 18 Decimal percision (Funciton empty)
        setTotalLockedPAW(data[4] as BigNumber); // 18 Decimal percision
        setTotalClaimableValue(data[5] as BigNumber); // 8 Decimal percision
        setVests(convertVestEntry(data[6] as VestEntryTuple[]));
        setLocks(convertVestEntry(data[7] as VestEntryTuple[]));
        setTotalLocksValue(data[9] as BigNumber); // 8 Decimal percision
        setTotalVestsValue(data[10] as BigNumber); // 8 Decimal percision
        priceOracleObj[keys[0]] = data[11] as BigNumber; // 8 Decimal percision
        (data[12] as BigNumber[]).map((d, i) => {
          // 8 Decimal percision
          priceOracleObj[keys[i + 1]] = d;
        });
        setClaimables(convertClaimables(data[8] as ClaimablesTuple[], priceOracleObj));
        setMainActionsLoading(false);
      })
      .catch((e) => console.error(e));
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
                  sx={{ padding: '8px 24px', width: downToSM ? '100%' : 'auto' }}
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
                  sx={{ padding: '8px 24px', width: downToSM ? '100%' : 'auto' }}
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
                  sx={{ padding: '8px 24px', width: downToSM ? '100%' : 'auto' }}
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
          <Typography>
            <Trans>Total vested</Trans>: {(totalVestsValue.toNumber() / 100_000_000).toFixed(2)} USD
          </Typography>
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
          <Box sx={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Typography>
              <Trans>Total locked</Trans>:
            </Typography>
            <FormattedNumber
              value={utils.formatUnits(totalLockedPAW.toString(), 18)}
              symbol="PAW"
            />
          </Box>
          {/** Value in USD */}
          <Typography>
            <Trans>Value</Trans>: {(totalLocksValue.toNumber() / 100_000_000).toFixed(2)} USD
          </Typography>
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
                        alt={`token image for ${addressSymbolMatching[claimable.token]}`}
                        src={`/icons/tokens/${addressSymbolMatching[claimable.token]}.svg`}
                        width={24}
                        height={24}
                      />
                      <Typography>{`m${addressSymbolMatching[
                        claimable.token
                      ].toUpperCase()}`}</Typography>
                    </TableCell>
                    <TableCell>
                      <FormattedNumber value={utils.formatUnits(claimable.amount, 18)} />
                    </TableCell>
                    <TableCell>
                      <FormattedNumber
                        value={utils.formatUnits(claimable.value, 10)}
                        symbol="USD"
                        visibleDecimals={3}
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
            <Typography>
              <Trans>Total Value</Trans>:{' '}
              {(totalClaimableValue.toNumber() / 100_000_000).toFixed(2)} USD
            </Typography>
            <Button onClick={handleClaimAll} variant="contained" sx={{ padding: '8px 24px' }}>
              <Trans>Claim All</Trans>
            </Button>
          </Box>
        </ManageMainPaper>
      </Box>
    </>
  );
};
