import {
  ChainId,
  EthereumTransactionTypeExtended,
  GasType,
  InterestRate,
} from '@aave/contract-helpers';
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

export type BorrowActionsProps = {
  poolReserve: ComputedReserveData;
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  setBorrowTxState: Dispatch<SetStateAction<TxState>>;
  amountToBorrow: string;
  handleClose: () => void;
  poolAddress: string;
  interestRateMode: InterestRate;
  isWrongNetwork: boolean;
  symbol: string;
  blocked: boolean;
};

export const BorrowActions = ({
  symbol,
  poolReserve,
  setGasLimit,
  amountToBorrow,
  setBorrowTxState,
  handleClose,
  poolAddress,
  interestRateMode,
  isWrongNetwork,
  blocked,
}: BorrowActionsProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const { action, loading, mainTxState, actionTx } = useTransactionHandler({
    tryPermit:
      currentMarketData.v3 && chainId !== ChainId.harmony && chainId !== ChainId.harmony_testnet,
    handleGetTxns: async () => {
      const tx: EthereumTransactionTypeExtended[] = await lendingPool.borrow({
        interestRateMode,
        user: currentAccount,
        amount: amountToBorrow,
        reserve: poolAddress,
        debtTokenAddress:
          interestRateMode === InterestRate.Variable
            ? poolReserve.variableDebtTokenAddress
            : poolReserve.stableDebtTokenAddress,
      });

      const gas: GasType | null = await tx[tx.length - 1].gas();
      setGasLimit(gas?.gasLimit);
      return tx;
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: !amountToBorrow || amountToBorrow === '0' || blocked,
    deps: [amountToBorrow, interestRateMode],
  });

  useEffect(() => {
    setBorrowTxState({
      success: !!mainTxState.txHash,
      txError: mainTxState.txError,
      gasEstimationError: mainTxState.gasEstimationError,
    });
  }, [setBorrowTxState, mainTxState]);

  const handleButtonStates = () => {
    if (loading && !actionTx) {
      return (
        <>
          {!blocked && <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />}
          <Trans>Borrow {symbol}</Trans>
        </>
      );
    } else if (!loading && (actionTx || blocked)) {
      return <Trans>Borrow {symbol}</Trans>;
    } else if (loading && actionTx) {
      return (
        <>
          <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
          <Trans>Pending...</Trans>
        </>
      );
    }
  };

  const hasAmount = amountToBorrow && amountToBorrow !== '0';

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      handleClose={handleClose}
      hasAmount={hasAmount}
      isWrongNetwork={isWrongNetwork}
      withAmount
      helperText={
        <RightHelperText
          actionHash={mainTxState.txHash}
          chainId={connectedChainId}
          action="borrow"
        />
      }
    >
      <>
        {hasAmount && !mainTxState.txHash && !mainTxState.txError && !isWrongNetwork && (
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
