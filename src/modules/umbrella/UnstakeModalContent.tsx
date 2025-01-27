import { ChainId } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import React, { useRef, useState } from 'react';
import { AssetInput } from 'src/components/transactions/AssetInput';
import { TxErrorView } from 'src/components/transactions/FlowCommons/Error';
import { GasEstimationError } from 'src/components/transactions/FlowCommons/GasEstimationError';
import { TxSuccessView } from 'src/components/transactions/FlowCommons/Success';
import { TxModalTitle } from 'src/components/transactions/FlowCommons/TxModalTitle';
import { GasStation } from 'src/components/transactions/GasStation/GasStation';
import { ChangeNetworkWarning } from 'src/components/transactions/Warnings/ChangeNetworkWarning';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { UnStakeActions } from './UnstakeModalActions';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useShallow } from 'zustand/shallow';
import { DetailsUnwrapSwitch } from 'src/components/transactions/FlowCommons/TxModalDetails';

// export type UnStakeProps = {
//   stakeToken: string;
//   icon: string;
// };

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

export const UnStakeModalContent = ({ stakeData }: { stakeData: MergedStakeData }) => {
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const [redeemATokens, setRedeemATokens] = useState(stakeData.underlyingIsWaToken);
  const [currentChainId, currentNetworkConfig] = useRootStore(
    useShallow((store) => [store.currentChainId, store.currentNetworkConfig])
  );

  // const { data } = useUmbrellaSummaryFor(stakeToken, currentMarketData);
  // const stakeData = data?.[0];

  // states
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  let balance = stakeData?.formattedBalances.stakeTokenRedeemableAmount || '0';
  console.log('amountToUnstake', balance);
  // TODOD
  // if (stakeData?.inPostSlashingPeriod) {
  //   amountToUnstake = stakeUserData?.stakeTokenUserBalance;
  // }

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? balance : _amount;

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? balance : value;
    setAmount(value);
  };

  // staking token usd value
  const amountInUsd = Number(amount) * Number(stakeData?.stakeTokenPrice); // TODO

  // error handler
  let blockingError: ErrorType | undefined = undefined;
  if (valueToBigNumber(amount).gt(balance)) {
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

  const nameFormatted = 'TODO'; // stakeAssetNameFormatted(stakeAssetName);

  const isWrongNetwork = currentChainId !== connectedChainId;

  // const networkConfig = getNetworkConfig(stakingChain);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (txState.success)
    return (
      <TxSuccessView
        action={<Trans>Unstaked</Trans>}
        amount={amountRef.current}
        symbol={nameFormatted}
      />
    );

  // console.log(icon);
  return (
    <>
      <TxModalTitle title="Unstake" symbol="TODO" />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={currentNetworkConfig.name} chainId={currentChainId} />
      )}
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={amountInUsd.toString()}
        symbol={nameFormatted}
        assets={[
          {
            balance: balance,
            symbol: stakeData.iconSymbol,
          },
        ]}
        isMaxSelected={isMaxSelected}
        maxValue={balance}
        balanceText={<Trans>Stake balance</Trans>}
      />

      {stakeData?.underlyingIsWaToken && (
        <DetailsUnwrapSwitch
          unwrapped={redeemATokens}
          setUnWrapped={setRedeemATokens}
          label={
            <Typography>
              <Trans>Redeem as aToken</Trans>
            </Typography>
          }
        />
      )}

      {blockingError !== undefined && (
        <Typography variant="helperText" color="red">
          {handleBlocked()}
        </Typography>
      )}
      <GasStation gasLimit={parseUnits(gasLimit || '0', 'wei')} chainId={ChainId.mainnet} />

      {txError && <GasEstimationError txError={txError} />}

      <UnStakeActions
        sx={{ mt: '48px' }}
        amountToUnStake={amount || '0'}
        isWrongNetwork={isWrongNetwork}
        symbol={nameFormatted}
        blocked={blockingError !== undefined}
        stakeData={stakeData}
        redeemATokens={redeemATokens}
      />
    </>
  );
};
