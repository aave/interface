import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { BigNumber, Contract, utils } from 'ethers';
import * as React from 'react';
import { NoData } from 'src/components/primitives/NoData';
import MANEKI_STAKING_DATA_PROVIDER_ABI from 'src/maneki/abi/stakingDataProbiderABI';

import PieIcon from '../../../../public/icons/markets/pie-icon.svg';
import { FormattedNumber } from '../../../components/primitives/FormattedNumber';
import { TopInfoPanel } from '../../../components/TopInfoPanel/TopInfoPanel';
import { TopInfoPanelItem } from '../../../components/TopInfoPanel/TopInfoPanelItem';
import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import { useManageContext } from '../../hooks/manage-data-provider/ManageDataProvider';

export const ManageTopPanel = () => {
  const {
    stakedPAW,
    lockedPAW,
    vestedPAW,
    setStakedPAW,
    setLockedPAW,
    setVestedPAW,
    lockedStakedValue,
    setLockedStakedValue,
    topPanelLoading,
    setTopPanelLoading,
  } = useManageContext();
  const [dailyPlatformFees, setDailyPlatformFees] = React.useState<BigNumber>(BigNumber.from(-1));
  const [dailyPenaltyFees, setDailyPenaltyFees] = React.useState<BigNumber>(BigNumber.from(-1));
  // const [loading, setLoading] = React.useState<boolean>(true);
  const { provider, currentAccount } = useWeb3Context();
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const valueTypographyVariant = downToSM ? 'main16' : 'main21';
  const symbolsVariant = downToSM ? 'secondary16' : 'secondary21';
  // eslint-disable-next-line prettier/prettier
  const MANEKI_DATA_PROVIDER_ADDR = marketsData.bsc_testnet_v3.addresses
    .STAKING_DATA_PROVIDER as string;

  React.useEffect(() => {
    if (!currentAccount) setTopPanelLoading(true);
    if (!provider) return;
    // create contract
    const contract = new Contract(
      MANEKI_DATA_PROVIDER_ADDR,
      MANEKI_STAKING_DATA_PROVIDER_ABI,
      provider
    );

    const promises = [];

    // add contract call into promise arr
    promises.push(contract.getUserUnlocked(currentAccount)); // staked paw
    promises.push(contract.getUserLocked(currentAccount)); // locked paw
    promises.push(contract.getUserVesting(currentAccount)); // vested paw
    promises.push(contract.getUserLockedStakedAndVestingInUsd(currentAccount)); // staked + locked + staked value
    promises.push(contract.getUserDailyPlatformFeeDistributionInUsd(currentAccount)); // daily platform fees
    promises.push(contract.getUserDailyPenaltyFeeDistributionInUsd(currentAccount)); // daily penalty fees

    Promise.all(promises)
      .then((data: BigNumber[]) => {
        setStakedPAW(data[0]); // 18 Decimal Percision
        setLockedPAW(data[1]); // 18 Decimal Percision
        setVestedPAW(data[2]); // 18 Decimal Percision
        setLockedStakedValue(data[3]); // 8 Decimal Percision
        setDailyPlatformFees(data[4]); // 8 Decimal Percision
        setDailyPenaltyFees(data[5]); // 8 Decimal Percision
        setTopPanelLoading(false);
      })
      .catch((error) => {
        console.error(error);
        console.log('Error fetching data in ManageTopPanel.');
      });
    //eslint-disable-next-line
  }, [currentAccount, provider, topPanelLoading]);

  return (
    <TopInfoPanel pageTitle={<Trans>Manage PAW</Trans>}>
      {/* Staked paw display */}
      <TopInfoPanelItem
        icon={<PieIcon />}
        title={<Trans>Staked + Locked PAW</Trans>}
        loading={currentAccount ? topPanelLoading : false}
      >
        {currentAccount ? (
          <>
            <FormattedNumber
              value={utils.formatUnits(lockedStakedValue, 8)}
              symbol="USD"
              variant={valueTypographyVariant}
              visibleDecimals={2}
              compact
              isTopPanel
              symbolsColor={theme.palette.text.secondary}
              symbolsVariant={symbolsVariant}
            />
            <Box sx={{ display: 'flex', gap: '6px' }}>
              <Typography>
                <Trans>Staked</Trans>:
              </Typography>
              <FormattedNumber value={utils.formatUnits(stakedPAW, 18)} symbol="PAW" />
            </Box>
            <Box sx={{ display: 'flex', gap: '6px' }}>
              <Typography>
                <Trans>Locked</Trans>:
              </Typography>
              <FormattedNumber value={utils.formatUnits(lockedPAW, 18)} symbol="PAW" />
            </Box>
            <Box sx={{ display: 'flex', gap: '6px' }}>
              <Typography>
                <Trans>Vested</Trans>:
              </Typography>
              <FormattedNumber value={utils.formatUnits(vestedPAW, 18)} symbol="PAW" />
            </Box>
          </>
        ) : (
          <NoData />
        )}
      </TopInfoPanelItem>

      {/* Daily revenue display */}
      <TopInfoPanelItem
        icon={<PieIcon />}
        title={<Trans>Daily revenue</Trans>}
        loading={currentAccount ? topPanelLoading : false}
      >
        {currentAccount ? (
          <FormattedNumber
            value={utils.formatUnits(dailyPlatformFees.add(dailyPenaltyFees), 8)}
            symbol="USD"
            variant={valueTypographyVariant}
            visibleDecimals={2}
            compact
            isTopPanel
            symbolsColor={theme.palette.text.secondary}
            symbolsVariant={symbolsVariant}
          />
        ) : (
          <NoData />
        )}
      </TopInfoPanelItem>

      {/* weekly revenue display */}
      <TopInfoPanelItem
        icon={<PieIcon />}
        title={<Trans>Weekly revenue</Trans>}
        loading={currentAccount ? topPanelLoading : false}
      >
        {currentAccount ? (
          <FormattedNumber
            value={utils.formatUnits(dailyPlatformFees.add(dailyPenaltyFees).mul(7), 8)}
            symbol="USD"
            variant={valueTypographyVariant}
            visibleDecimals={2}
            compact
            isTopPanel
            symbolsColor={theme.palette.text.secondary}
            symbolsVariant={symbolsVariant}
          />
        ) : (
          <NoData />
        )}
      </TopInfoPanelItem>

      {/* Platform fee display */}
      <TopInfoPanelItem
        icon={<PieIcon />}
        title={<Trans>Daily platform fees</Trans>}
        loading={currentAccount ? topPanelLoading : false}
      >
        {currentAccount ? (
          <FormattedNumber
            value={utils.formatUnits(dailyPlatformFees, 8)}
            symbol="USD"
            variant={valueTypographyVariant}
            visibleDecimals={2}
            compact
            isTopPanel
            symbolsColor={theme.palette.text.secondary}
            symbolsVariant={symbolsVariant}
          />
        ) : (
          <NoData />
        )}
      </TopInfoPanelItem>

      {/* Penalty Fee display */}
      <TopInfoPanelItem
        icon={<PieIcon />}
        title={<Trans>Daily penalty fees</Trans>}
        loading={currentAccount ? topPanelLoading : false}
      >
        {currentAccount ? (
          <FormattedNumber
            value={utils.formatUnits(dailyPenaltyFees, 8)}
            symbol="USD"
            variant={valueTypographyVariant}
            visibleDecimals={2}
            compact
            isTopPanel
            symbolsColor={theme.palette.text.secondary}
            symbolsVariant={symbolsVariant}
          />
        ) : (
          <NoData />
        )}
      </TopInfoPanelItem>
    </TopInfoPanel>
  );
};
