import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import { AssetInput } from '../AssetInput';
import { normalize, valueToBigNumber } from '@aave/math-utils';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { Trans } from '@lingui/macro';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useStakeData } from 'src/hooks/stake-data-provider/StakeDataProvider';
import { getStakeConfig } from 'src/ui-config/stakeConfig';
import { UnStakeActions } from './UnStakeActions';
import { GasStation } from '../GasStation/GasStation';
import { parseUnits } from 'ethers/lib/utils';
import { useModalContext } from 'src/hooks/useModal';

export type UnStakeProps = {
  stakeAssetName: string;
  icon: string;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

type StakingType = 'aave' | 'bpt';

export const UnStakeModalContent = ({ stakeAssetName, icon }: UnStakeProps) => {
  const data = useStakeData();
  const stakeData = data.stakeGeneralResult?.stakeGeneralUIData[stakeAssetName as StakingType];
  const { chainId: connectedChainId } = useWeb3Context();
  const stakeConfig = getStakeConfig();
  const { gasLimit, mainTxState: txState } = useModalContext();

  // states
  const [amount, setAmount] = useState('');
  const [amountToUnStake, setAmountToUnStake] = useState(amount);
  const [isMax, setIsMax] = useState(false);
  const [maxAmount, setMaxAmount] = useState('0');

  const walletBalance = normalize(
    data.stakeUserResult?.stakeUserUIData[stakeAssetName as StakingType].stakeTokenUserBalance ||
      '0',
    18
  );

  useEffect(() => {
    if (amount === '-1') {
      setAmountToUnStake(walletBalance);
      setIsMax(true);
    } else {
      setAmountToUnStake(amount);
      setIsMax(false);
    }
  }, [amount, walletBalance]);

  useEffect(() => {
    if (isMax) {
      setMaxAmount(walletBalance);
    }
  }, [isMax]);

  // This amount will stay the same after tx is submited even if we have an interval
  // between tx success and tx success confirmation. This way all calcs are static
  // and don't get recalculated in this interval state
  const staticAmount = isMax ? maxAmount : amountToUnStake;

  // staking token usd value
  const amountInUsd =
    Number(staticAmount) *
    (Number(normalize(stakeData?.stakeTokenPriceEth || 1, 18)) /
      Number(normalize(data.stakeGeneralResult?.stakeGeneralUIData.usdPriceEth || 1, 18)));

  // error handler
  let blockingError: ErrorType | undefined = undefined;
  if (valueToBigNumber(staticAmount).gt(walletBalance)) {
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

  // is Network mismatched
  const stakingChain = stakeConfig.chainId;
  const networkConfig = getNetworkConfig(stakingChain);
  const isWrongNetwork = connectedChainId !== stakingChain;

  if (txState.txError) return <TxErrorView errorMessage={txState.txError} />;
  if (txState.success) return <TxSuccessView action="Staked" amount={staticAmount} symbol={icon} />;

  return (
    <>
      <TxModalTitle title="Unstake" symbol={icon} />
      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={stakingChain} />
      )}
      <AssetInput
        value={staticAmount}
        onChange={setAmount}
        usdValue={amountInUsd.toString()}
        symbol={icon}
        assets={[
          {
            balance: walletBalance.toString(),
            symbol: icon,
          },
        ]}
      />
      {blockingError !== undefined && (
        <Typography variant="helperText" color="red">
          {handleBlocked()}
        </Typography>
      )}
      <GasStation gasLimit={parseUnits(gasLimit || '0', 'wei')} />
      {txState.gasEstimationError && <GasEstimationError error={txState.gasEstimationError} />}
      <UnStakeActions
        sx={{ mt: '48px' }}
        amountToUnStake={amount}
        isWrongNetwork={isWrongNetwork}
        symbol={icon}
        blocked={blockingError !== undefined}
        selectedToken={stakeAssetName}
      />
    </>
  );
};
