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
import { useStakingContext } from '../../hooks/staking-data-provider/StakingDataProvider';
import MANEKI_DATA_PROVIDER_ABI from './DataABI';

interface NumReturn {
  _hex: string;
  _isBigNumber: boolean;
}

export const StakeTopPanel = () => {
  const { stakedPAW, setStakedPAW, share, setShare, dailyRevenue, setDailyRevenue } =
    useStakingContext();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [lpPrice, setLpPrice] = React.useState<number>(-1);
  const { provider, currentAccount } = useWeb3Context();
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const valueTypographyVariant = downToSM ? 'main16' : 'main21';
  const symbolsVariant = downToSM ? 'secondary16' : 'secondary21';
  // eslint-disable-next-line prettier/prettier
  const MANEKI_DATA_PROVIDER_ADDR = marketsData.arbitrum_mainnet_v3.addresses
    .STAKING_DATA_PROVIDER as string;

  React.useEffect(() => {
    if (!provider) return;
    // create contract
    const contract = new Contract(MANEKI_DATA_PROVIDER_ADDR, MANEKI_DATA_PROVIDER_ABI, provider);
    const promises = [];

    // add contract call into promise arr
    promises.push(contract.getUserLpStaked(currentAccount)); // staked paw
    promises.push(contract.getUserSharePercentage(currentAccount)); // user share % - 4 dec
    promises.push(contract.getUserDailyRewardsInUsd(currentAccount)); // daily revenue
    promises.push(contract.getLpPrice()); // lpprice

    // call promise all and get data
    Promise.all(promises)
      .then((data: NumReturn[]) => {
        // dev change data setting logic here
        setStakedPAW(parseInt(data[0]._hex, 16));
        setShare(parseInt(data[1]._hex, 16));
        setDailyRevenue(parseInt(data[2]._hex, 16));
        setLpPrice(parseInt(data[3]._hex, 16));
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [provider]);

  return (
    <TopInfoPanel pageTitle={<Trans>Stake</Trans>}>
      {/* Staked paw display */}
      <TopInfoPanelItem icon={<PieIcon />} title={<Trans>Your Staked PAW</Trans>} loading={loading}>
        <FormattedNumber
          value={stakedPAW.toString()}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
          compact
          symbolsColor="#A5A8B6"
          symbolsVariant={symbolsVariant}
        />
        price {stakedPAW * lpPrice}
      </TopInfoPanelItem>

      {/* Share display */}
      <TopInfoPanelItem icon={<PieIcon />} title={<Trans>Share</Trans>} loading={loading}>
        <FormattedNumber
          value={share.toString()}
          symbol="%"
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
    </TopInfoPanel>
  );
};
