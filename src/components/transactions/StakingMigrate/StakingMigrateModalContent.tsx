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
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { GasStation } from '../GasStation/GasStation';
import { StakingMigrateActions } from './StakingMigrateActions';

export const StakingMigrateModalContent = () => {
  const { gasLimit, mainTxState } = useModalContext();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const { data: stakeUserResult } = useUserStakeUiData(currentMarketData, Stake.bpt);
  const { data: stakeGeneralResult } = useGeneralStakeUiData(currentMarketData, Stake.bpt);

  const stakeData = stakeGeneralResult?.[0];
  const stakeUserData = stakeUserResult?.[0];

  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  // const walletBalance = normalize(stakeUserData?.underlyingTokenUserBalance || '0', 18);

  const maxAmountToMigrate = normalize(stakeUserData?.stakeTokenUserBalance || '0', 18);
  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToMigrate : _amount;
  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxAmountToMigrate : value;
    setAmount(value);
  };

  // staking token usd value
  const amountInUsd = Number(amount) * Number(stakeData?.stakeTokenPriceUSDFormatted);

  if (!mainTxState.success)
    return (
      <TxSuccessView
        action={<Trans>Migrated</Trans>}
        amount={amountRef.current}
        symbol={'stkABPT'}
      />
    );

  return (
    <>
      <TxModalTitle title="Migrate to ABPT v2" />
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={amountInUsd.toString()}
        symbol="stkBPT"
        assets={[
          {
            balance: maxAmountToMigrate.toString(),
            symbol: 'stkBPT',
          },
        ]}
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToMigrate.toString()}
        balanceText={<Trans>Wallet balance</Trans>}
      />
      <GasStation gasLimit={parseUnits(gasLimit || '0', 'wei')} />
      <StakingMigrateActions amountToMigrate={amount} />
    </>
  );
};
