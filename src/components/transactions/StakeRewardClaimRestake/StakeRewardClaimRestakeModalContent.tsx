import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import { CooldownWarning } from 'src/components/Warnings/CooldownWarning';
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
import { DetailsNumberLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { StakeRewardClaimRestakeActions } from './StakeRewardClaimRestakeActions';

export type StakeRewardClaimRestakeProps = {
  stakeAssetName: string;
  icon: string;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

export const StakeRewardClaimRestakeModalContent = ({
  stakeAssetName,
  icon,
}: StakeRewardClaimRestakeProps) => {
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const currentChainId = useRootStore((store) => store.currentChainId);

  const TOKEN_STAKING_ADDRESS = stakeConfig.tokens[stakeAssetName].TOKEN_STAKING;
  const TOKEN_STAKING_ORACLE = stakeConfig.tokens[stakeAssetName].TOKEN_ORACLE;

  const { data: stakeUserResult } = useUserStakeUiData(
    currentMarketData,
    [TOKEN_STAKING_ADDRESS],
    [TOKEN_STAKING_ORACLE]
  );
  const { data: stakeGeneralResult } = useGeneralStakeUiData(
    currentMarketData,
    [TOKEN_STAKING_ADDRESS],
    [TOKEN_STAKING_ORACLE]
  );

  let stakeData;
  if (stakeGeneralResult && Array.isArray(stakeGeneralResult.stakeData)) {
    [stakeData] = stakeGeneralResult.stakeData;
  }

  let stakeUserData;
  if (stakeUserResult && Array.isArray(stakeUserResult.stakeUserData)) {
    [stakeUserData] = stakeUserResult.stakeUserData;
  }

  // hardcoded as all rewards will be in aave token
  const rewardsSymbol = 'AAVE';
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  const maxAmountToClaim = normalize(stakeUserData?.userIncentivesToClaim || '0', 18);
  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToClaim : _amount;

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxAmountToClaim : value;
    setAmount(value);
  };

  // staking token usd value
  const amountInUsd =
    Number(maxAmountToClaim) * Number(normalize(stakeData?.stakeTokenPriceUSD || 1, 18));
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
        action={<Trans>Restaked</Trans>}
        amount={amountRef.current}
        symbol={rewardsSymbol}
      />
    );

  return (
    <>
      <TxModalTitle title="Restake AAVE rewards" />
      {isWrongNetwork && !readOnlyModeAddress && (
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
            balance: maxAmountToClaim.toString(),
            symbol: icon,
          },
        ]}
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToClaim.toString()}
        balanceText={<Trans>Amount claimable</Trans>}
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
      {txError && <GasEstimationError txError={txError} />}

      <StakeRewardClaimRestakeActions
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
