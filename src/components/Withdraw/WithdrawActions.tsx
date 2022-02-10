import { ChainId, EthereumTransactionTypeExtended, GasType } from '@aave/contract-helpers';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useGasStation } from 'src/hooks/useGasStation';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { GasOption } from '../GasStation/GasStationProvider';
import { RightHelperText } from '../FlowCommons/RightHelperText';
import { Box, Button, CircularProgress } from '@mui/material';
import { Trans } from '@lingui/macro';
import { TxState } from 'src/helpers/types';

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
          <Trans>WITHDRAW {symbol}</Trans>
        </>
      );
    } else if (!loading && (actionTx || blocked)) {
      return <Trans>WITHDRAW {symbol}</Trans>;
    } else if (loading && actionTx) {
      return (
        <>
          <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
          <Trans>WITHDRAW {symbol} PENDING...</Trans>
        </>
      );
    } else if (!loading && !actionTx) {
      return <Trans>WITHDRAW {symbol}</Trans>;
    }
  };

  const hasAmount = amountToWithdraw && amountToWithdraw !== '0';
  // TODO: hash link not working
  return (
    <Box sx={{ mt: '16px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <RightHelperText
          actionHash={mainTxState.txHash}
          chainId={connectedChainId}
          action="withdraw"
        />
      </Box>
      {!hasAmount && (
        <Button variant="contained" disabled>
          <Trans>ENTER AN AMOUNT</Trans>
        </Button>
      )}
      {hasAmount && !mainTxState.txHash && !mainTxState.txError && (
        <Button
          variant="contained"
          onClick={action}
          disabled={loading || isWrongNetwork || blocked || !!mainTxState.gasEstimationError}
        >
          {handleButtonStates()}
        </Button>
      )}
      {(mainTxState.txHash || mainTxState.txError) && (
        <Button onClick={handleClose} variant="contained">
          {!mainTxState.txError && <Trans>OK, </Trans>}
          <Trans>CLOSE</Trans>
        </Button>
      )}
    </Box>
  );
};
