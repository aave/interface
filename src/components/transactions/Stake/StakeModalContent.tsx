import { normalize, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useStakeData } from 'src/hooks/stake-data-provider/StakeDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getStakeConfig } from 'src/ui-config/stakeConfig';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { CooldownWarning } from '../../Warnings/CooldownWarning';
import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { StakeActions } from './StakeActions';

export type StakeProps = {
  stakeAssetName: string;
  icon: string;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

type StakingType = 'aave' | 'bpt';

export const StakeModalContent = ({ stakeAssetName, icon }: StakeProps) => {
  const data = useStakeData();
  const stakeData = data.stakeGeneralResult?.stakeGeneralUIData[stakeAssetName as StakingType];
  const { chainId: connectedChainId } = useWeb3Context();
  const stakeConfig = getStakeConfig();
  const { gasLimit, mainTxState: txState } = useModalContext();

  // states
  const [amount, setAmount] = useState('');
  const [amountToSupply, setAmountToSupply] = useState(amount);
  const [blockingError, setBlockingError] = useState<ErrorType | undefined>();
  const [isMax, setIsMax] = useState(false);
  const [maxAmount, setMaxAmount] = useState('0');

  const walletBalance = normalize(
    data.stakeUserResult?.stakeUserUIData[stakeAssetName as StakingType]
      .underlyingTokenUserBalance || '0',
    18
  );

  useEffect(() => {
    if (amount === '-1') {
      setAmountToSupply(walletBalance);
      setIsMax(true);
    } else {
      setAmountToSupply(amount);
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
  const staticAmount = isMax ? maxAmount : amountToSupply;

  // staking token usd value
  const amountInUsd =
    Number(staticAmount) *
    (Number(normalize(stakeData?.stakeTokenPriceEth || 1, 18)) /
      Number(normalize(data.stakeGeneralResult?.stakeGeneralUIData.usdPriceEth || 1, 18)));

  // error handler
  useEffect(() => {
    if (valueToBigNumber(staticAmount).gt(walletBalance)) {
      setBlockingError(ErrorType.NOT_ENOUGH_BALANCE);
    } else {
      setBlockingError(undefined);
    }
  }, [walletBalance, staticAmount]);

  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <Trans>Not enough balance on your wallet</Trans>;
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
      <TxModalTitle title="Stake" symbol={icon} />
      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={stakingChain} />
      )}

      <CooldownWarning />

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
      <TxModalDetails stakeAPR={stakeData?.stakeApy || '0'} gasLimit={gasLimit} />
      {txState.gasEstimationError && <GasEstimationError error={txState.gasEstimationError} />}
      <StakeActions
        sx={{ mt: '48px' }}
        amountToStake={amountToSupply}
        isWrongNetwork={isWrongNetwork}
        symbol={icon}
        blocked={blockingError !== undefined}
        selectedToken={stakeAssetName}
      />
    </>
  );
};
