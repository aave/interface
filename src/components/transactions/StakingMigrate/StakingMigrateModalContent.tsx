import { Stake } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { parseUnits } from 'ethers/lib/utils';
import { useRef, useState } from 'react';
import { useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

import { AssetInput } from '../AssetInput';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { GasStation } from '../GasStation/GasStation';
import { StakingMigrateActions } from './StakingMigrateActions';

export const StakingMigrateModalContent = () => {
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { data: stakeUserResult } = useUserStakeUiData(currentMarketData, Stake.bpt);
  const { data: stakeGeneralResult } = useGeneralStakeUiData(currentMarketData, Stake.bpt);

  let stakeData;
  if (stakeGeneralResult && Array.isArray(stakeGeneralResult.stakeData)) {
    [stakeData] = stakeGeneralResult.stakeData;
  }

  let stakeUserData;
  if (stakeUserResult && Array.isArray(stakeUserResult.stakeUserData)) {
    [stakeUserData] = stakeUserResult.stakeUserData;
  }

  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  const walletBalance = normalize(stakeUserData?.underlyingTokenUserBalance || '0', 18);

  const maxAmountToMigrate = normalize(
    stakeUserResult?.stakeUserData[0].underlyingTokenUserBalance || '0',
    18
  );
  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToMigrate : _amount;
  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxAmountToMigrate : value;
    setAmount(value);
  };

  // staking token usd value
  const amountInUsd = Number(amount) * Number(normalize(stakeData?.stakeTokenPriceUSD || 1, 8));

  console.log(stakeData);
  return (
    <>
      <TxModalTitle title="Migrate to ABPT v2" />
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={amountInUsd.toString()}
        symbol={Stake.bpt}
        assets={[
          {
            balance: maxAmountToMigrate.toString(),
            symbol: Stake.bpt,
          },
        ]}
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToMigrate.toString()}
        balanceText={<Trans>Wallet balance</Trans>}
      />
      <GasStation gasLimit={parseUnits(gasLimit || '0', 'wei')} />
      <StakingMigrateActions />
    </>
  );
};
