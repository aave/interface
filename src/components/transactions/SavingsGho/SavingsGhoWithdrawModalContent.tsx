import { ChainId, Stake } from '@aave/contract-helpers';
import { normalize, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import React, { useRef, useState } from 'react';
import { useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { stakeAssetNameFormatted, stakeConfig } from 'src/ui-config/stakeConfig';

import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { GasStation } from '../GasStation/GasStation';
import { SavingsGhoWithdrawActions } from './SavingsGhoWithdrawActions';

export type UnStakeProps = {
  icon: string;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

export const SavingsGhoModalWithdrawContent = ({ icon }: UnStakeProps) => {
  const { chainId: connectedChainId } = useWeb3Context();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const currentChainId = useRootStore((store) => store.currentChainId);

  const { data: stakeUserResult } = useUserStakeUiData(currentMarketData, Stake.gho);
  const { data: stakeGeneralResult } = useGeneralStakeUiData(currentMarketData, Stake.gho);

  const stakeData = stakeGeneralResult?.[0];
  const stakeUserData = stakeUserResult?.[0];
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  if (!stakeData || !stakeUserData) {
    return null;
  }

  let amountToUnstake = stakeUserData?.userCooldownAmount;
  if (stakeData?.inPostSlashingPeriod || stakeData?.stakeCooldownSeconds === 0) {
    amountToUnstake = stakeUserData?.stakeTokenUserBalance;
  }

  const balance = normalize(amountToUnstake || '0', 18);

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? balance : _amount;

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? balance : value;
    setAmount(value);
  };

  // staking token usd value
  const amountInUsd = Number(amount) * Number(stakeData?.stakeTokenPriceUSDFormatted);

  // error handler
  let blockingError: ErrorType | undefined = undefined;
  if (valueToBigNumber(amount).gt(balance)) {
    blockingError = ErrorType.NOT_ENOUGH_BALANCE;
  }

  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <Trans>Not enough staked balance</Trans>;
      default:
        return null;
    }
  };

  const nameFormatted = stakeAssetNameFormatted(Stake.gho);

  // is Network mismatched
  const stakingChain =
    currentNetworkConfig.isFork && currentNetworkConfig.underlyingChainId === stakeConfig.chainId
      ? currentChainId
      : stakeConfig.chainId;
  const isWrongNetwork = connectedChainId !== stakingChain;

  // const networkConfig = getNetworkConfig(stakingChain);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (txState.success)
    return (
      <TxSuccessView
        action={<Trans>withdrew</Trans>}
        amount={amountRef.current}
        symbol={nameFormatted}
      />
    );

  return (
    <>
      {/* {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={stakingChain} />
      )} */}
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={amountInUsd.toString()}
        symbol={nameFormatted}
        assets={[
          {
            balance: balance,
            symbol: icon,
          },
        ]}
        isMaxSelected={isMaxSelected}
        maxValue={balance}
        balanceText={<Trans>Staking balance</Trans>}
      />
      {blockingError !== undefined && (
        <Typography variant="helperText" color="red">
          {handleBlocked()}
        </Typography>
      )}
      <GasStation gasLimit={parseUnits(gasLimit || '0', 'wei')} chainId={ChainId.mainnet} />

      {txError && <GasEstimationError txError={txError} />}

      <SavingsGhoWithdrawActions
        sx={{ mt: '48px' }}
        amountToUnStake={amount}
        isWrongNetwork={isWrongNetwork}
        symbol={nameFormatted}
        blocked={blockingError !== undefined}
        selectedToken={Stake.gho}
        stakeData={stakeData}
        stakeUserData={stakeUserData}
      />
    </>
  );
};
