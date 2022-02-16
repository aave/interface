import { ChainId, EthereumTransactionTypeExtended, GasType } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Button, CircularProgress } from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { TxState } from 'src/helpers/types';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useGasStation } from 'src/hooks/useGasStation';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { RightHelperText } from '../FlowCommons/RightHelperText';
import { GasOption } from '../GasStation/GasStationProvider';
import { TxActionsWrapper } from '../TxActionsWrapper';

export type WithdrawActionsProps = {
  poolReserve: ComputedReserveData;
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  setWithdrawTxState: Dispatch<SetStateAction<TxState>>;
  amountToWithdraw: string;
  handleClose: () => void;
  poolAddress: string;
  isWrongNetwork: boolean;
  symbol: string;
  blocked: boolean;
};

export const WithdrawActions = ({
  poolReserve,
  setGasLimit,
  amountToWithdraw,
  setWithdrawTxState,
  handleClose,
  poolAddress,
  isWrongNetwork,
  symbol,
  blocked,
}: WithdrawActionsProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const { action, loading, mainTxState, actionTx } = useTransactionHandler({
    tryPermit:
      currentMarketData.v3 && chainId !== ChainId.harmony && chainId !== ChainId.harmony_testnet,
    handleGetTxns: async () => {
      const tx: EthereumTransactionTypeExtended[] = await lendingPool.withdraw({
        user: currentAccount,
        reserve: poolAddress,
        amount: amountToWithdraw,
        aTokenAddress: poolReserve.aTokenAddress,
      });

      const gas: GasType | null = await tx[tx.length - 1].gas();
      setGasLimit(gas?.gasLimit);
      return tx;
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: !amountToWithdraw || parseFloat(amountToWithdraw) === 0 || blocked,
    deps: [amountToWithdraw],
  });

  useEffect(() => {
    setWithdrawTxState({
      success: !!mainTxState.txHash,
      txError: mainTxState.txError,
      gasEstimationError: mainTxState.gasEstimationError,
    });
  }, [setWithdrawTxState, mainTxState]);

  const handleButtonStates = () => {
    if (loading && !actionTx) {
      return (
        <>
          {!blocked && <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />}
          <Trans>Withdraw {symbol}</Trans>
        </>
      );
    } else if (!loading && (actionTx || blocked)) {
      return <Trans>Withdraw {symbol}</Trans>;
    } else if (loading && actionTx) {
      return (
        <>
          <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
          <Trans>Withdraw {symbol} pending...</Trans>
        </>
      );
    } else if (!loading && !actionTx) {
      return <Trans>Withdraw {symbol}</Trans>;
    }
  };

  const hasAmount = amountToWithdraw && amountToWithdraw !== '0';
  // TODO: hash link not working

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      handleClose={handleClose}
      hasAmount={hasAmount}
      withAmount
      helperText={
        <RightHelperText
          actionHash={mainTxState.txHash}
          chainId={connectedChainId}
          action="withdraw"
        />
      }
    >
      <>
        {hasAmount && !mainTxState.txHash && !mainTxState.txError && (
          <Button
            variant="contained"
            onClick={action}
            disabled={loading || isWrongNetwork || blocked || !!mainTxState.gasEstimationError}
            size="large"
            sx={{ minHeight: '44px' }}
          >
            {handleButtonStates()}
          </Button>
        )}
      </>
    </TxActionsWrapper>
  );
};
