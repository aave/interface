import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import { normalize } from '@aave/math-utils';
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
import { StakeRewardClaimActions } from './StakeRewardClaimActions';

export type StakeRewardClaimProps = {
  stakeAssetName: string;
  handleClose: () => void;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

type StakingType = 'aave' | 'bpt';

export const StakeRewardClaimModalContent = ({
  stakeAssetName,
  handleClose,
}: StakeRewardClaimProps) => {
  const data = useStakeData();
  const stakeData = data.stakeGeneralResult?.stakeGeneralUIData[stakeAssetName as StakingType];
  const { chainId: connectedChainId } = useWeb3Context();

  // states
  const [txState, setTxState] = useState<TxState>({ success: false });
  // const [amount, setAmount] = useState('-1');
  // const [amountToClaim, setAmountToClaim] = useState(amount);
  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [blockingError, setBlockingError] = useState<ErrorType | undefined>();

  // hardcoded as all rewards will be in aave token
  const rewardsSymbol = 'AAVE';

  const amount = '-1';
  const maxAmountToClaim = normalize(
    data.stakeUserResult?.stakeUserUIData[stakeAssetName as StakingType].userIncentivesToClaim ||
      '0',
    18
  );

  // staking token usd value
  const amountInUsd =
    Number(maxAmountToClaim) *
    (Number(normalize(stakeData?.stakeTokenPriceEth || 1, 18)) /
      Number(normalize(data.stakeGeneralResult?.stakeGeneralUIData.usdPriceEth || 1, 18)));

  // error handler
  useEffect(() => {
    if (maxAmountToClaim === '0') {
      setBlockingError(ErrorType.NOT_ENOUGH_BALANCE);
    } else {
      setBlockingError(undefined);
    }
  }, [maxAmountToClaim]);

  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <Trans>No rewards to claim</Trans>;
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
          <TxModalTitle title="Claim" symbol={rewardsSymbol} />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={stakingChain} />
          )}
          {blockingError !== undefined && (
            <Typography variant="helperText" color="red">
              {handleBlocked()}
            </Typography>
          )}
          <TxModalDetails
            sx={{ mt: '30px' }}
            gasLimit={gasLimit}
            stakeRewards={maxAmountToClaim}
            stakeRewardsInUsd={amountInUsd.toString()}
          />
        </>
      )}
      {txState.txError && <TxErrorView errorMessage={txState.txError} />}
      {txState.success && !txState.txError && (
        <TxSuccessView action="Claimed" amount={maxAmountToClaim} symbol={rewardsSymbol} />
      )}
      {txState.gasEstimationError && <GasEstimationError error={txState.gasEstimationError} />}
      <StakeRewardClaimActions
        sx={{ mt: '48px' }}
        setTxState={setTxState}
        amountToClaim={amount}
        handleClose={handleClose}
        isWrongNetwork={isWrongNetwork}
        setGasLimit={setGasLimit}
        symbol={rewardsSymbol}
        blocked={blockingError !== undefined}
        selectedToken={stakeAssetName}
      />
    </>
  );
};
