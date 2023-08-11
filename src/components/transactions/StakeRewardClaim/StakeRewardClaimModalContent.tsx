import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import React, { useRef, useState } from 'react';
import { useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { stakeConfig } from 'src/ui-config/stakeConfig';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { GasStation } from '../GasStation/GasStation';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { StakeRewardClaimActions } from './StakeRewardClaimActions';

export type StakeRewardClaimProps = {
  stakeAssetName: string;
  icon: string;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

type StakingType = 'aave' | 'bpt';

export const StakeRewardClaimModalContent = ({ stakeAssetName, icon }: StakeRewardClaimProps) => {
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const { currentNetworkConfig, currentChainId } = useProtocolDataContext();
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  const { data: stakeUserResult } = useUserStakeUiData();
  const { data: stakeGeneralResult } = useGeneralStakeUiData();
  const stakeData = stakeGeneralResult?.[stakeAssetName as StakingType];

  // hardcoded as all rewards will be in aave token
  const rewardsSymbol = 'MCAKE';

  const maxAmountToClaim = normalize(
    stakeUserResult?.[stakeAssetName as StakingType].userIncentivesToClaim || '0',
    18
  );
  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToClaim : _amount;
  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxAmountToClaim : value;
    setAmount(value);
  };
  // staking token usd value
  const amountInUsd =
    Number(maxAmountToClaim) *
    (Number(normalize(stakeData?.stakeTokenPriceEth || 1, 18)) *
      Number(normalize(stakeGeneralResult?.ethPriceUsd || 1, 8)));

  // error handler
  let blockingError: ErrorType | undefined = undefined;
  if (maxAmountToClaim === '0') {
    blockingError = ErrorType.NOT_ENOUGH_BALANCE;
  }

  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <Trans>No rewards to claim</Trans>;
      default:
        return null;
    }
  };

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
        action={<Trans>Claimed</Trans>}
        amount={amountRef.current}
        symbol={rewardsSymbol}
      />
    );

  return (
    <>
      <TxModalTitle title="Claim" symbol={rewardsSymbol} />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={stakingChain} />
      )}
      {blockingError !== undefined && (
        <Typography variant="helperText" color="red">
          {handleBlocked()}
        </Typography>
      )}
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={amountInUsd.toString()}
        symbol={icon}
        assets={[
          {
            balance: maxAmountToClaim.toString(),
            symbol: icon,
          },
        ]}
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToClaim.toString()}
        balanceText={<Trans>Amount claimable</Trans>}
      />
      <GasStation gasLimit={parseUnits(gasLimit || '0', 'wei')} />

      {txError && <GasEstimationError txError={txError} />}

      <StakeRewardClaimActions
        sx={{ mt: '48px' }}
        amountToClaim={amount}
        isWrongNetwork={isWrongNetwork}
        symbol={rewardsSymbol}
        blocked={blockingError !== undefined || Number(amount) === 0}
        selectedToken={stakeAssetName}
      />
    </>
  );
};
