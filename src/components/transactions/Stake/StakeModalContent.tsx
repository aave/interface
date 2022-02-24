import { normalize, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
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
import { DetailsNumberLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
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
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  const walletBalance = normalize(
    data.stakeUserResult?.stakeUserUIData[stakeAssetName as StakingType]
      .underlyingTokenUserBalance || '0',
    18
  );

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? walletBalance : _amount;

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? walletBalance : value;
    setAmount(value);
  };

  // staking token usd value
  const amountInUsd =
    Number(amount) *
    (Number(normalize(stakeData?.stakeTokenPriceEth || 1, 18)) /
      Number(normalize(data.stakeGeneralResult?.stakeGeneralUIData.usdPriceEth || 1, 18)));

  // error handler
  let blockingError: ErrorType | undefined = undefined;
  if (valueToBigNumber(amount).gt(walletBalance)) {
    blockingError = ErrorType.NOT_ENOUGH_BALANCE;
  }

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
  if (txState.success)
    return <TxSuccessView action="Staked" amount={amountRef.current} symbol={icon} />;

  return (
    <>
      <TxModalTitle title="Stake" symbol={icon} />
      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={stakingChain} />
      )}

      <CooldownWarning />

      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={amountInUsd.toString()}
        symbol={icon}
        assets={[
          {
            balance: walletBalance.toString(),
            symbol: icon,
          },
        ]}
        isMaxSelected={isMaxSelected}
        maxValue={walletBalance.toString()}
      />
      {blockingError !== undefined && (
        <Typography variant="helperText" color="red">
          {handleBlocked()}
        </Typography>
      )}
      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLine
          description={<Trans>Staking APR</Trans>}
          value={Number(stakeData?.stakeApy || '0') / 10000}
          percent
        />
      </TxModalDetails>
      {txState.gasEstimationError && <GasEstimationError error={txState.gasEstimationError} />}
      <StakeActions
        sx={{ mt: '48px' }}
        amountToStake={amount}
        isWrongNetwork={isWrongNetwork}
        symbol={icon}
        blocked={blockingError !== undefined}
        selectedToken={stakeAssetName}
      />
    </>
  );
};
