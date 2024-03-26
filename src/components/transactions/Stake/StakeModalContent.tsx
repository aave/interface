import { ChainId, Stake } from '@aave/contract-helpers';
import { normalize, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import { useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { stakeAssetNameFormatted, stakeConfig } from 'src/ui-config/stakeConfig';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { STAKE } from 'src/utils/mixPanelEvents';

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
  stakeAssetName: Stake;
  icon: string;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

export const StakeModalContent = ({ stakeAssetName, icon }: StakeProps) => {
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const currentChainId = useRootStore((store) => store.currentChainId);

  const { data: stakeUserResult } = useUserStakeUiData(currentMarketData, stakeAssetName);
  const { data: stakeGeneralResult } = useGeneralStakeUiData(currentMarketData, stakeAssetName);

  const stakeData = stakeGeneralResult?.[0];
  const stakeUserData = stakeUserResult?.[0];

  // states
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  const walletBalance = normalize(stakeUserData?.underlyingTokenUserBalance || '0', 18);

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? walletBalance : _amount;

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? walletBalance : value;
    setAmount(value);
  };

  // staking token usd value
  const amountInUsd = Number(amount) * Number(stakeData?.stakeTokenPriceUSDFormatted);

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

  const nameFormatted = stakeAssetNameFormatted(stakeAssetName);

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
        action={<Trans>Staked</Trans>}
        amount={amountRef.current}
        symbol={nameFormatted}
      />
    );

  return (
    <>
      <TxModalTitle title="Stake" symbol={nameFormatted} />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          networkName={networkConfig.name}
          chainId={stakingChain}
          funnel={'Stake Modal'}
        />
      )}

      <CooldownWarning />

      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={amountInUsd.toString()}
        symbol={nameFormatted}
        assets={[
          {
            balance: walletBalance.toString(),
            symbol: icon,
          },
        ]}
        isMaxSelected={isMaxSelected}
        maxValue={walletBalance.toString()}
        balanceText={<Trans>Wallet balance</Trans>}
      />
      {blockingError !== undefined && (
        <Typography variant="helperText" color="red">
          {handleBlocked()}
        </Typography>
      )}
      <TxModalDetails gasLimit={gasLimit} chainId={ChainId.mainnet}>
        <DetailsNumberLine
          description={<Trans>Staking APR</Trans>}
          value={Number(stakeData?.stakeApy || '0') / 10000}
          percent
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <StakeActions
        sx={{ mt: '48px' }}
        amountToStake={amount}
        isWrongNetwork={isWrongNetwork}
        symbol={nameFormatted}
        blocked={blockingError !== undefined}
        selectedToken={stakeAssetName}
        event={STAKE.STAKE_TOKEN}
      />
    </>
  );
};
