import { Trans } from '@lingui/macro';
import { useMediaQuery, useTheme } from '@mui/material';
import { Contract } from 'ethers';
import * as React from 'react';

import PieIcon from '../../../../public/icons/markets/pie-icon.svg';
import { FormattedNumber } from '../../../components/primitives/FormattedNumber';
import { TopInfoPanel } from '../../../components/TopInfoPanel/TopInfoPanel';
import { TopInfoPanelItem } from '../../../components/TopInfoPanel/TopInfoPanelItem';
import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import { useManageContext } from '../../hooks/manage-data-provider/ManageDataProvider';
import MANEKI_DATA_PROVIDER_ABI from './DataABI';

interface NumReturn {
  _hex: string;
  _isBigNumber: boolean;
}

export const ManageTopPanel = () => {
  const { stakedPAW, lockedPAW, setStakedPAW, setLockedPAW } = useManageContext();
  const [dailyPlatformFees, setDailyPlatformFees] = React.useState<number>(-1);
  const [dailyPenaltyFees, setDailyPenaltyFees] = React.useState<number>(-1);
  const [dailyRevenue, setDailyRevenue] = React.useState<number>(-1);
  const [loading, setLoading] = React.useState<boolean>(true);
  const { provider, currentAccount } = useWeb3Context();
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const valueTypographyVariant = downToSM ? 'main16' : 'main21';
  const symbolsVariant = downToSM ? 'secondary16' : 'secondary21';
  // eslint-disable-next-line prettier/prettier
  const MANEKI_DATA_PROVIDER_ADDR = marketsData.bsc_testnet_v3.addresses
    .STAKING_DATA_PROVIDER as string;

  React.useEffect(() => {
    if (!provider) return;
    // create contract
    const contract = new Contract(MANEKI_DATA_PROVIDER_ADDR, MANEKI_DATA_PROVIDER_ABI, provider);

    const promises = [];

    // add contract call into promise arr
    promises.push(contract.getUserLpStaked(currentAccount)); // staked paw
    promises.push(contract.getTotalPawLocked(currentAccount)); // locked paw
    promises.push(contract.getLpPrice()); // daily platform fees dev : missing
    promises.push(contract.getUserDailyRewardsInUsd(currentAccount)); // daily revenue dev : error execution reverted
    promises.push(contract.getLpPrice()); // daily penalty fees dev : missing

    // call promise all and get data
    Promise.all(promises)
      .then((data: NumReturn[]) => {
        // dev change data setting logic here
        setStakedPAW(parseInt(data[0]._hex, 16));
        setLockedPAW(parseInt(data[1]._hex, 16));
        setDailyPlatformFees(parseInt(data[2]._hex, 16));
        setDailyRevenue(parseInt(data[3]._hex, 16));
        setDailyPenaltyFees(parseInt(data[4]._hex, 16));
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [provider]);
  return (
    <TopInfoPanel pageTitle={<Trans>Manage PAW</Trans>}>
      {/* Staked paw display */}
      <TopInfoPanelItem
        icon={<PieIcon />}
        title={<Trans>Staked + Locked PAW</Trans>}
        loading={loading}
      >
        <FormattedNumber
          value={(stakedPAW + lockedPAW).toString()}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
          compact
          symbolsColor="#A5A8B6"
          symbolsVariant={symbolsVariant}
        />
      </TopInfoPanelItem>

      {/* Daily revenue display */}
      <TopInfoPanelItem icon={<PieIcon />} title={<Trans>Daily revenue</Trans>} loading={loading}>
        <FormattedNumber
          value={dailyRevenue.toString()}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
          compact
          symbolsColor="#A5A8B6"
          symbolsVariant={symbolsVariant}
        />
      </TopInfoPanelItem>

      {/* weekly revenue display */}
      <TopInfoPanelItem icon={<PieIcon />} title={<Trans>Weekly revenue</Trans>} loading={loading}>
        <FormattedNumber
          value={(7 * dailyRevenue).toString()}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
          compact
          symbolsColor="#A5A8B6"
          symbolsVariant={symbolsVariant}
        />
      </TopInfoPanelItem>

      {/* Platform fee display */}
      <TopInfoPanelItem
        icon={<PieIcon />}
        title={<Trans>Daily playform fees</Trans>}
        loading={loading}
      >
        <FormattedNumber
          value={dailyPlatformFees.toString()}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
          compact
          symbolsColor="#A5A8B6"
          symbolsVariant={symbolsVariant}
        />
      </TopInfoPanelItem>

      {/* Penalty Fee display */}
      <TopInfoPanelItem
        icon={<PieIcon />}
        title={<Trans>Daily penalty fees</Trans>}
        loading={loading}
      >
        <FormattedNumber
          value={dailyPenaltyFees.toString()}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
          compact
          symbolsColor="#A5A8B6"
          symbolsVariant={symbolsVariant}
        />
      </TopInfoPanelItem>
    </TopInfoPanel>
  );
};
