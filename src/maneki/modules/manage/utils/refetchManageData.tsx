import { BigNumber, Contract } from 'ethers';
// import { useEffect } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useManageContext } from 'src/maneki/hooks/manage-data-provider/ManageDataProvider';
import { marketsData } from 'src/ui-config/marketsConfig';

import MANEKI_DATA_PROVIDER_ABI from '../DataABI';
import PAW_TOKEN_ABI from '../PAWTokenABI';

export const useRefetchData = () => {
  const PAW_TOKEN_ADDR = marketsData.bsc_testnet_v3.addresses.PAW_TOKEN as string;
  const MANEKI_DATA_PROVIDER_ADDR = marketsData.bsc_testnet_v3.addresses
    .STAKING_DATA_PROVIDER as string;

  const {
    // balancePAW,
    setBalancePAW,
    // stakedPAW,
    setStakedPAW,
    // lockedPAW,
    setLockedPAW,
    // lockedStakedValue,
    setLockedStakedValue,
    // topPanelLoading,
    setTopPanelLoading,
  } = useManageContext();
  setTopPanelLoading(true);
  const { provider, currentAccount } = useWeb3Context();
  const contract = new Contract(MANEKI_DATA_PROVIDER_ADDR, MANEKI_DATA_PROVIDER_ABI, provider);
  const pawContract = new Contract(PAW_TOKEN_ADDR, PAW_TOKEN_ABI, provider);
  const promises = [];

  promises.push(pawContract.balanceOf(currentAccount));
  promises.push(contract.getUnlockedPaw(currentAccount)); // staked paw
  promises.push(contract.getTotalPawLocked(currentAccount)); // locked paw
  promises.push(contract.getUserLockedAndStakedPawInUsd(currentAccount)); // staked + locked value
  promises.push(contract.getUserDailyPlatformFeeDistributionInUsd(currentAccount)); // daily platform fees
  promises.push(contract.getUserDailyPenaltyFeeDistributionInUsd(currentAccount)); // daily penalty fees
  Promise.all(promises)
    .then((data: BigNumber[]) => {
      // dev change data setting logic here
      setBalancePAW(data[0]);
      setStakedPAW(data[1]); // 18 Decimal Percision
      setLockedPAW(data[2]); // 18 Decimal Percision
      setLockedStakedValue(data[3]); // 8 Decimal Percision
      // setDailyPlatformFees(data[3]); // 8 Decimal Percision
      // setDailyPenaltyFees(data[4]); // 8 Decimal Percision
      setTopPanelLoading(false);
    })
    .catch((e) => console.error(e));
};
