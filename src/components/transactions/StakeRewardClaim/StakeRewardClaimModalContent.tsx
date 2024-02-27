import { Stake } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import React, { useRef, useState } from 'react';
import { useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
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
  stakeAssetName: Stake;
  icon: string;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

export const StakeRewardClaimModalContent = ({ stakeAssetName, icon }: StakeRewardClaimProps) => {
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const currentChainId = useRootStore((store) => store.currentChainId);
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  const { data: stakeUserResult } = useUserStakeUiData(currentMarketData, stakeAssetName);
  const { data: stakeGeneralResult } = useGeneralStakeUiData(currentMarketData, stakeAssetName);

  const stakeData = stakeGeneralResult?.[0];
  const stakeUserData = stakeUserResult?.[0];

  // hardcoded as all rewards will be in aave token
  const rewardsSymbol = 'AAVE';

  const maxAmountToClaim = normalize(stakeUserData?.userIncentivesToClaim || '0', 18);
  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToClaim : _amount;
  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxAmountToClaim : value;
    setAmount(value);
  };

  const amountInUsd = Number(amount) * Number(stakeData?.rewardTokenPriceUSDFormatted);

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
