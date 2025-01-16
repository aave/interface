import { ChainId, Stake } from '@aave/contract-helpers';
import { normalize, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useRef, useState } from 'react';
import { Asset, AssetInput } from 'src/components/transactions/AssetInput';
import { TxErrorView } from 'src/components/transactions/FlowCommons/Error';
import { GasEstimationError } from 'src/components/transactions/FlowCommons/GasEstimationError';
import { TxSuccessView } from 'src/components/transactions/FlowCommons/Success';
import {
  DetailsCooldownLine,
  DetailsNumberLine,
  TxModalDetails,
} from 'src/components/transactions/FlowCommons/TxModalDetails';
import { TxModalTitle } from 'src/components/transactions/FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from 'src/components/transactions/Warnings/ChangeNetworkWarning';
import { CooldownWarning } from 'src/components/Warnings/CooldownWarning';
import { useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { stakeAssetNameFormatted, stakeConfig } from 'src/ui-config/stakeConfig';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { STAKE } from 'src/utils/mixPanelEvents';

import {
  selectStakeDataByAddress,
  selectUserStakeDataByAddress,
  useStakeData,
  useUserStakeData,
} from './hooks/useStakeData';
import { UmbrellaActions } from './UmbrellaActions';

export type StakeProps = {
  stakeData: MergedStakeData;
  icon: string;
};
export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

interface StakeInputAsset extends Asset {
  balance: string;
}

const getInputTokens = (stakeData: MergedStakeData): StakeInputAsset[] => {
  return stakeData.underlyingIsWaToken
    ? [
        {
          address: stakeData.waTokenData.waTokenUnderlying,
          symbol: stakeData.waTokenData.waTokenUnderlyingSymbol,
          iconSymbol: stakeData.waTokenData.waTokenUnderlyingSymbol,
          balance: stakeData.balances.underlyingWaTokenBalance,
        },
        {
          address: stakeData.waTokenData.waTokenAToken,
          symbol: stakeData.waTokenData.waTokenATokenSymbol,
          iconSymbol: stakeData.waTokenData.waTokenATokenSymbol,
          balance: stakeData.balances.underlyingWaTokenATokenBalance,
          aToken: true,
        },
      ]
    : [
        {
          address: stakeData.stakeTokenUnderlying,
          symbol: stakeData.stakeTokenSymbol,
          iconSymbol: stakeData.stakeTokenSymbol,
          balance: stakeData.balances.underlyingTokenBalance,
        },
      ];
};

export const UmbrellaModalContent = ({ stakeData }: StakeProps) => {
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const currentChainId = useRootStore((store) => store.currentChainId);

  // states
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  const assets = getInputTokens(stakeData);

  console.log(assets);

  const [inputToken, setInputToken] = useState<StakeInputAsset>(assets[0]);

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? inputToken.balance : _amount;

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? inputToken.balance : value;
    setAmount(value);
  };

  // error handler
  let blockingError: ErrorType | undefined = undefined;
  if (valueToBigNumber(amount).gt(inputToken.balance)) {
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
  const stakingChain =
    currentNetworkConfig.isFork && currentNetworkConfig.underlyingChainId === stakeConfig.chainId
      ? currentChainId
      : stakeConfig.chainId;
  const isWrongNetwork = connectedChainId !== stakingChain;

  const networkConfig = getNetworkConfig(stakingChain);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  // if (txState.success)
  //   return (
  //     <TxSuccessView
  //       action={<Trans>Staked</Trans>}
  //       amount={amountRef.current}
  //       symbol={nameFormatted}
  //     />
  //   );

  return (
    <>
      <TxModalTitle title="Stake" symbol={''} />

      {/* TODO do we handle this for markets? */}
      {/* {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          networkName={networkConfig.name}
          chainId={stakingChain}
          funnel={'Stake Modal'}
        />
      )} */}

      <CooldownWarning />

      <AssetInput
        value={amount}
        onChange={handleChange}
        onSelect={setInputToken}
        // usdValue={amountInUsd.toString()}
        usdValue="0"
        symbol={inputToken.symbol}
        assets={assets}
        isMaxSelected={isMaxSelected}
        maxValue={inputToken.balance.toString()}
        balanceText={<Trans>Wallet balance</Trans>}
      />
      {/* {blockingError !== undefined && (
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
        <DetailsCooldownLine cooldownDays={10} />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <UmbrellaActions
        sx={{ mt: '48px' }}
        amountToStake={amount}
        isWrongNetwork={isWrongNetwork}
        symbol={nameFormatted}
        blocked={blockingError !== undefined}
        selectedToken={umbrellaAssetName}
        event={STAKE.STAKE_TOKEN}
      /> */}
    </>
  );
};
