import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import { AssetInput } from '../AssetInput';
import { normalize, valueToBigNumber } from '@aave/math-utils';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { TxState } from 'src/helpers/types';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { Trans } from '@lingui/macro';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useStakeData } from 'src/hooks/stake-data-provider/StakeDataProvider';
import { stakeConfig } from 'src/ui-config/stakeConfig';
import { UnStakeActions } from './UnStakeActions';

export type UnStakeProps = {
  stakeAssetName: string;
  icon: string;
  handleClose: () => void;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

type StakingType = 'aave' | 'bpt';

export const UnStakeModalContent = ({ stakeAssetName, icon, handleClose }: UnStakeProps) => {
  const data = useStakeData();
  const stakeData = data.stakeGeneralResult?.stakeGeneralUIData[stakeAssetName as StakingType];
  const { chainId: connectedChainId } = useWeb3Context();

  // states
  const [txState, setTxState] = useState<TxState>({ success: false });
  const [amount, setAmount] = useState('');
  const [amountToUnStake, setAmountToUnStake] = useState(amount);
  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [blockingError, setBlockingError] = useState<ErrorType | undefined>();

  const walletBalance = normalize(
    data.stakeUserResult?.stakeUserUIData[stakeAssetName as StakingType].stakeTokenUserBalance ||
      '0',
    18
  );

  useEffect(() => {
    if (amount === '-1') {
      setAmountToUnStake(walletBalance);
    } else {
      setAmountToUnStake(amount);
    }
  }, [amount, walletBalance]);

  // staking token usd value
  const amountInUsd =
    Number(amountToUnStake) *
    (Number(normalize(stakeData?.stakeTokenPriceEth || 1, 18)) /
      Number(normalize(data.stakeGeneralResult?.stakeGeneralUIData.usdPriceEth || 1, 18)));

  // error handler
  useEffect(() => {
    if (valueToBigNumber(amountToUnStake).gt(walletBalance)) {
      setBlockingError(ErrorType.NOT_ENOUGH_BALANCE);
    } else {
      setBlockingError(undefined);
    }
  }, [walletBalance, amountToUnStake]);

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

  return (
    <>
      {!txState.txError && !txState.success && (
        <>
          <TxModalTitle title="Unstake" symbol={icon} />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={stakingChain} />
          )}
          <AssetInput
            value={amountToUnStake}
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
          TODO: Maybe put here remaining time? not clear in the design
          <TxModalDetails sx={{ mt: '30px' }} gasLimit={gasLimit} />
        </>
      )}
      {txState.txError && <TxErrorView errorMessage={txState.txError} />}
      {txState.success && !txState.txError && (
        <TxSuccessView action="Staked" amount={amountToUnStake} symbol={icon} />
      )}
      {txState.gasEstimationError && <GasEstimationError error={txState.gasEstimationError} />}
      <UnStakeActions
        sx={{ mt: '48px' }}
        setTxState={setTxState}
        amountToUnStake={amount}
        handleClose={handleClose}
        isWrongNetwork={isWrongNetwork}
        setGasLimit={setGasLimit}
        symbol={icon}
        blocked={blockingError !== undefined}
        selectedToken={stakeAssetName}
      />
    </>
  );
};
