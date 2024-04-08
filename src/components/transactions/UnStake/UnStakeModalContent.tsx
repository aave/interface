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
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { GasStation } from '../GasStation/GasStation';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { UnStakeActions } from './UnStakeActions';

export type UnStakeProps = {
  stakeAssetName: Stake;
  icon: string;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

export const UnStakeModalContent = ({ stakeAssetName, icon }: UnStakeProps) => {
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const currentChainId = useRootStore((store) => store.currentChainId);

  const { data: stakeUserResult } = useUserStakeUiData(currentMarketData, stakeAssetName);
  const { data: stakeGeneralResult } = useGeneralStakeUiData(currentMarketData, stakeAssetName);

  const stakeData = stakeGeneralResult?.[0];
  const stakeUserData = stakeUserResult?.[0];

  // states
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  let amountToUnstake = stakeUserData?.userCooldownAmount;
  if (stakeData?.inPostSlashingPeriod) {
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

  const nameFormatted = stakeAssetNameFormatted(stakeAssetName);

  // is Network mismatched
  const stakingChain =
    currentNetworkConfig.isFork && currentNetworkConfig.underlyingChainId === stakeConfig.chainId
      ? currentChainId
      : stakeConfig.chainId;
  const isWrongNetwork = connectedChainId !== stakingChain;

  const networkConfig = getNetworkConfig(stakingChain);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (txState.success)
    return (
      <TxSuccessView
        action={<Trans>Unstaked</Trans>}
        amount={amountRef.current}
        symbol={nameFormatted}
      />
    );

  console.log(icon);
  return (
    <>
      <TxModalTitle title="Unstake" symbol={nameFormatted} />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={stakingChain} />
      )}
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

      <UnStakeActions
        sx={{ mt: '48px' }}
        amountToUnStake={amount}
        isWrongNetwork={isWrongNetwork}
        symbol={nameFormatted}
        blocked={blockingError !== undefined}
        selectedToken={stakeAssetName}
      />
    </>
  );
};
