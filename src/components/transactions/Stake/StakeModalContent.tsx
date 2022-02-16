import React, { useEffect, useState } from 'react';
import { StakeActions } from './StakeActions';
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
import { CooldownWarning } from '../../Warnings/CooldownWarning';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useStakeData } from 'src/hooks/stake-data-provider/StakeDataProvider';
import { getStakeConfig } from 'src/ui-config/stakeConfig';

export type StakeProps = {
  stakeAssetName: string;
  icon: string;
  handleClose: () => void;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

type StakingType = 'aave' | 'bpt';

export const StakeModalContent = ({ stakeAssetName, icon, handleClose }: StakeProps) => {
  const data = useStakeData();
  const stakeData = data.stakeGeneralResult?.stakeGeneralUIData[stakeAssetName as StakingType];
  const { chainId: connectedChainId } = useWeb3Context();
  const stakeConfig = getStakeConfig();

  // states
  const [txState, setTxState] = useState<TxState>({ success: false });
  const [amount, setAmount] = useState('');
  const [amountToSupply, setAmountToSupply] = useState(amount);
  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [blockingError, setBlockingError] = useState<ErrorType | undefined>();

  const walletBalance = normalize(
    data.stakeUserResult?.stakeUserUIData[stakeAssetName as StakingType]
      .underlyingTokenUserBalance || '0',
    18
  );

  useEffect(() => {
    if (amount === '-1') {
      setAmountToSupply(walletBalance);
    } else {
      setAmountToSupply(amount);
    }
  }, [amount, walletBalance]);

  // staking token usd value
  const amountInUsd =
    Number(amountToSupply) *
    (Number(normalize(stakeData?.stakeTokenPriceEth || 1, 18)) /
      Number(normalize(data.stakeGeneralResult?.stakeGeneralUIData.usdPriceEth || 1, 18)));

  // error handler
  useEffect(() => {
    if (valueToBigNumber(amountToSupply).gt(walletBalance)) {
      setBlockingError(ErrorType.NOT_ENOUGH_BALANCE);
    } else {
      setBlockingError(undefined);
    }
  }, [walletBalance, amountToSupply]);

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

  return (
    <>
      {!txState.txError && !txState.success && (
        <>
          <TxModalTitle title="Stake" symbol={icon} />
          <CooldownWarning />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={stakingChain} />
          )}

          <AssetInput
            value={amountToSupply}
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
          <TxModalDetails
            sx={{ mt: '30px' }}
            stakeAPR={stakeData?.stakeApy || '0'}
            gasLimit={gasLimit}
          />
        </>
      )}
      {txState.txError && <TxErrorView errorMessage={txState.txError} />}
      {txState.success && !txState.txError && (
        <TxSuccessView action="Staked" amount={amountToSupply} symbol={icon} />
      )}
      {txState.gasEstimationError && <GasEstimationError error={txState.gasEstimationError} />}
      <StakeActions
        sx={{ mt: '48px' }}
        setTxState={setTxState}
        amountToStake={amountToSupply}
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
