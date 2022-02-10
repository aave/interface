import React, { useEffect, useState } from 'react';
import { useAppDataContext } from '../../hooks/app-data-provider/useAppDataProvider';
import { StakeActions } from './StakeActions';
import { Typography } from '@mui/material';
import { AssetInput } from '../AssetInput';
import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { getNetworkConfig, isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';
import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { TxState } from 'src/helpers/types';
import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { Trans } from '@lingui/macro';
import { CooldownWarning } from '../Warnings/CooldownWarning';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { StakeGeneralData } from 'src/hooks/app-data-provider/graphql/hooks';
import { useStakeData } from 'src/hooks/stake-data-provider/StakeDataProvider';

export type StakeProps = {
  stakeAsset: string;
  stakeAssetName: string;
  icon: string;
  handleClose: () => void;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
  CAP_REACHED,
}

type StakingType = 'aave' | 'bpt';

export const StakeModalContent = ({
  stakeAsset,
  stakeAssetName,
  icon,
  handleClose,
}: StakeProps) => {
  const { walletBalances } = useWalletBalances();
  const data = useStakeData();
  const stakeData = data.stakeGeneralResult?.stakeGeneralUIData[stakeAssetName as StakingType];
  const { user } = useAppDataContext();
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  // states
  const [txState, setTxState] = useState<TxState>({ success: false });
  const [amount, setAmount] = useState('');
  const [amountToSupply, setAmountToSupply] = useState(amount);
  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [blockingError, setBlockingError] = useState<ErrorType | undefined>();

  const networkConfig = getNetworkConfig(currentChainId);

  const walletBalance = walletBalances[stakeAsset]?.amount || '0';

  useEffect(() => {
    if (amount === '-1') {
      setAmountToSupply(walletBalance);
    } else {
      setAmountToSupply(amount);
    }
  }, [amount, walletBalance]);

  // tbd
  const amountInUsd = 1000;

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
  const isWrongNetwork = currentChainId !== connectedChainId;

  return (
    <>
      {!txState.txError && !txState.success && (
        <>
          <TxModalTitle title="Stake" symbol={icon} />
          <CooldownWarning />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
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
        amountToSupply={amountToSupply}
        handleClose={handleClose}
        isWrongNetwork={isWrongNetwork}
        setGasLimit={setGasLimit}
        stakingContract={'0x0'}
        symbol={icon}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
