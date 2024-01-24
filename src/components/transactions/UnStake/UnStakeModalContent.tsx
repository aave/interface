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
import { stakeConfig } from 'src/ui-config/stakeConfig';
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
  stakeAssetName: string;
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

  // states
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  // TODO does this need to change?
  const walletBalance = normalize(stakeUserData?.userCooldownAmount || '0', 18);

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? walletBalance : _amount;

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? walletBalance : value;
    setAmount(value);
  };

  // staking token usd value
  const amountInUsd = Number(amount) * Number(normalize(stakeData?.stakeTokenPriceUSD || 1, 18));

  // error handler
  let blockingError: ErrorType | undefined = undefined;
  if (valueToBigNumber(amount).gt(walletBalance)) {
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
      <TxSuccessView action={<Trans>Unstaked</Trans>} amount={amountRef.current} symbol={icon} />
    );

  return (
    <>
      <TxModalTitle title="Unstake" symbol={icon} />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={stakingChain} />
      )}
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={amountInUsd.toString()}
        symbol={icon}
        assets={[
          {
            balance: walletBalance,
            symbol: icon,
          },
        ]}
        isMaxSelected={isMaxSelected}
        maxValue={walletBalance}
        balanceText={<Trans>Staking balance</Trans>}
      />
      {blockingError !== undefined && (
        <Typography variant="helperText" color="red">
          {handleBlocked()}
        </Typography>
      )}
      <GasStation gasLimit={parseUnits(gasLimit || '0', 'wei')} />

      {txError && <GasEstimationError txError={txError} />}

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
