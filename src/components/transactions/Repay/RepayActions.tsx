import {
  ChainId,
  EthereumTransactionTypeExtended,
  GasType,
  InterestRate,
  Pool,
} from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps, Button, CircularProgress } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { TxState } from 'src/helpers/types';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useGasStation } from 'src/hooks/useGasStation';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { LeftHelperText } from '../FlowCommons/LeftHelperText';
import { RightHelperText } from '../FlowCommons/RightHelperText';
import { GasOption } from '../GasStation/GasStationProvider';
import { TxActionsWrapper } from '../TxActionsWrapper';

export interface RepayActionProps extends BoxProps {
  amountToRepay: string;
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  setRepayTxState: Dispatch<SetStateAction<TxState>>;
  customGasPrice?: string;
  handleClose: () => void;
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  poolAddress: string;
  symbol: string;
  debtType: InterestRate;
  repayWithATokens: boolean;
  blocked: boolean;
}

export const RepayActions = ({
  amountToRepay,
  poolReserve,
  setRepayTxState,
  handleClose,
  setGasLimit,
  poolAddress,
  isWrongNetwork,
  sx,
  symbol,
  debtType,
  repayWithATokens,
  blocked,
  ...props
}: RepayActionProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const [approving, setApproving] = useState(false);

  const {
    approval,
    approved,
    action,
    requiresApproval,
    loading,
    approvalTxState,
    mainTxState,
    usePermit,
    resetStates,
  } = useTransactionHandler({
    tryPermit:
      currentMarketData.v3 && chainId !== ChainId.harmony && chainId !== ChainId.harmony_testnet,
    handleGetTxns: async () => {
      if (currentMarketData.v3) {
        // TO-DO: No need for this cast once a single Pool type is used in use-tx-builder-context
        const newPool: Pool = lendingPool as Pool;
        let tx: EthereumTransactionTypeExtended[];
        if (repayWithATokens) {
          tx = await newPool.repayWithATokens({
            user: currentAccount,
            reserve: poolReserve.underlyingAsset,
            amount: amountToRepay.toString(),
            rateMode: debtType as InterestRate,
          });
        } else {
          tx = await newPool.repay({
            user: currentAccount,
            reserve: poolReserve.underlyingAsset,
            amount: amountToRepay.toString(),
            interestRateMode: debtType,
          });
        }
        const gas: GasType | null = await tx[tx.length - 1].gas();
        setGasLimit(gas?.gasLimit);
        return tx;
      } else {
        const tx = await lendingPool.repay({
          user: currentAccount,
          reserve: poolReserve.underlyingAsset,
          amount: amountToRepay.toString(),
          interestRateMode: debtType,
        });
        const gas: GasType | null = await tx[tx.length - 1].gas();
        setGasLimit(gas?.gasLimit);
        return tx;
      }
      // TODO: add here the case for repay with collateral
    },
    handleGetPermitTxns: async (signature) => {
      const newPool: Pool = lendingPool as Pool;
      const tx = await newPool.repayWithPermit({
        user: currentAccount,
        reserve: poolReserve.underlyingAsset,
        amount: amountToRepay, // amountToRepay.toString(),
        interestRateMode: debtType,
        signature,
      });
      const gas: GasType | null = await tx[tx.length - 1].gas();
      setGasLimit(gas?.gasLimit);
      return tx;
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: !amountToRepay || parseFloat(amountToRepay) === 0 || blocked,
    deps: [amountToRepay, poolAddress],
  });

  const hasAmount = amountToRepay && amountToRepay !== '0';

  useEffect(() => {
    setApproving(false);
    setRepayTxState({
      success: !!mainTxState.txHash,
      txError: mainTxState.txError || approvalTxState.txError,
      gasEstimationError: mainTxState.gasEstimationError || approvalTxState.gasEstimationError,
    });
  }, [setRepayTxState, mainTxState, approvalTxState]);

  const handleRetry = () => {
    setApproving(false);
    setRepayTxState({
      txError: undefined,
      success: false,
      gasEstimationError: undefined,
    });
    resetStates();
  };

  const handleApprove = () => {
    approval(amountToRepay, poolAddress);
    setApproving(true);
  };

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      handleClose={handleClose}
      approvalTxState={approvalTxState}
      handleRetry={handleRetry}
      hasAmount={hasAmount}
      requiresApproval={requiresApproval}
      isWrongNetwork={isWrongNetwork}
      withAmount
      helperText={
        <>
          <LeftHelperText
            amount={amountToRepay}
            error={mainTxState.txError || approvalTxState.txError}
            approvalHash={approvalTxState.txHash}
            actionHash={mainTxState.txHash}
            requiresApproval={requiresApproval}
          />
          <RightHelperText
            approvalHash={approvalTxState.txHash}
            actionHash={mainTxState.txHash}
            chainId={connectedChainId}
            usePermit={usePermit}
            action="supply"
          />
        </>
      }
      sx={sx}
      {...props}
    >
      <>
        {hasAmount && requiresApproval && !approved && !approvalTxState.txError && !isWrongNetwork && (
          <Button
            variant="contained"
            onClick={handleApprove}
            disabled={approved || loading || isWrongNetwork || blocked}
            size="large"
            sx={{ minHeight: '44px', mb: 2 }}
          >
            {!loading && <Trans>Approve to continue</Trans>}
            {loading && (
              <>
                <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
                {approving ? (
                  <Trans>Approving {symbol}...</Trans>
                ) : (
                  <Trans>Approve to continue</Trans>
                )}
              </>
            )}
          </Button>
        )}
        {hasAmount &&
          !mainTxState.txHash &&
          !mainTxState.txError &&
          !approvalTxState.txError &&
          !isWrongNetwork && (
            <Button
              variant="contained"
              onClick={action}
              disabled={
                loading ||
                (requiresApproval && !approved) ||
                isWrongNetwork ||
                !!mainTxState.gasEstimationError
              }
              size="large"
              sx={{ minHeight: '44px' }}
            >
              {!loading && <Trans>Repay {symbol}</Trans>}
              {loading && (
                <>
                  {((approved && requiresApproval) || !requiresApproval) && (
                    <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
                  )}
                  <Trans>Repay {symbol}</Trans>
                </>
              )}
            </Button>
          )}
      </>
    </TxActionsWrapper>
  );
};
