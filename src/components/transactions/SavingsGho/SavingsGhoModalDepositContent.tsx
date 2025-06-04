import { ChainId, Stake } from '@aave/contract-helpers';
import { normalize, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import { useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useMeritIncentives } from 'src/hooks/useMeritIncentives';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { stakeAssetNameFormatted, stakeConfig } from 'src/ui-config/stakeConfig';
import { STAKE } from 'src/utils/events';
import { GHO_SYMBOL } from 'src/utils/ghoUtilities';
import { useShallow } from 'zustand/shallow';

import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsNumberLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { SavingsGhoDepositActions } from './SavingsGhoDepositActions';

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

export const SavingsGhoModalDepositContent = () => {
  const { chainId: connectedChainId } = useWeb3Context();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const [currentMarketData, currentNetworkConfig, currentChainId] = useRootStore(
    useShallow((store) => [
      store.currentMarketData,
      store.currentNetworkConfig,
      store.currentChainId,
    ])
  );
  const { data: meritIncentives } = useMeritIncentives({
    symbol: 'GHO',
    market: currentMarketData.market,
  });
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  const { data: stakeUserResult } = useUserStakeUiData(currentMarketData, Stake.gho);
  const { data: stakeGeneralResult } = useGeneralStakeUiData(currentMarketData, Stake.gho);
  const stakeData = stakeGeneralResult?.[0];
  const stakeUserData = stakeUserResult?.[0];

  const walletBalance = normalize(stakeUserData?.underlyingTokenUserBalance || '0', 18);

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? walletBalance : _amount;

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? walletBalance : value;
    setAmount(value);
  };

  const amountInUsd = Number(amount) * Number(stakeData?.stakeTokenPriceUSDFormatted);

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

  const nameFormatted = stakeAssetNameFormatted(Stake.gho);

  // is Network mismatched
  const stakingChain =
    currentNetworkConfig.isFork && currentNetworkConfig.underlyingChainId === stakeConfig.chainId
      ? currentChainId
      : stakeConfig.chainId;
  const isWrongNetwork = connectedChainId !== stakingChain;

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (txState.success)
    return (
      <TxSuccessView
        action={<Trans>deposited</Trans>}
        amount={amountRef.current}
        symbol={nameFormatted}
      />
    );

  return (
    <>
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={amountInUsd.toString()}
        symbol={nameFormatted}
        assets={[
          {
            balance: walletBalance.toString(),
            symbol: GHO_SYMBOL,
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
          description={<Trans>APR</Trans>}
          value={meritIncentives?.incentiveAPR || '0'}
          percent
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <SavingsGhoDepositActions
        sx={{ mt: '48px' }}
        amountToStake={amount}
        isWrongNetwork={isWrongNetwork}
        symbol={nameFormatted}
        blocked={blockingError !== undefined}
        selectedToken={Stake.gho}
        event={STAKE.STAKE_TOKEN}
      />
    </>
  );
};
