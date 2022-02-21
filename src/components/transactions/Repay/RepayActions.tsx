import { ChainId, InterestRate, Pool } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
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
  customGasPrice?: string;
  poolAddress: string;
  symbol: string;
  debtType: InterestRate;
  repayWithATokens: boolean;
  blocked: boolean;
}

export const RepayActions = ({
  amountToRepay,
  poolReserve,
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

  const {
    approval,
    action,
    requiresApproval,
    loadingTxns,
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
        if (repayWithATokens) {
          return await newPool.repayWithATokens({
            user: currentAccount,
            reserve: poolReserve.underlyingAsset,
            amount: amountToRepay.toString(),
            rateMode: debtType as InterestRate,
          });
        } else {
          return await newPool.repay({
            user: currentAccount,
            reserve: poolReserve.underlyingAsset,
            amount: amountToRepay.toString(),
            interestRateMode: debtType,
          });
        }
      } else {
        return await lendingPool.repay({
          user: currentAccount,
          reserve: poolReserve.underlyingAsset,
          amount: amountToRepay.toString(),
          interestRateMode: debtType,
        });
      }
      // TODO: add here the case for repay with collateral
    },
    handleGetPermitTxns: async (signature) => {
      const newPool: Pool = lendingPool as Pool;
      return await newPool.repayWithPermit({
        user: currentAccount,
        reserve: poolReserve.underlyingAsset,
        amount: amountToRepay, // amountToRepay.toString(),
        interestRateMode: debtType,
        signature,
      });
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: !amountToRepay || parseFloat(amountToRepay) === 0 || blocked,
    deps: [amountToRepay, poolAddress],
  });

  return (
    <TxActionsWrapper
      preparingTransactions={loadingTxns}
      symbol={poolReserve.symbol}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      handleRetry={resetStates}
      requiresAmount
      amount={amountToRepay}
      requiresApproval={requiresApproval}
      isWrongNetwork={isWrongNetwork}
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
      handleAction={action}
      handleApproval={() => approval(amountToRepay, poolAddress)}
      actionText={<Trans>Repay {symbol}</Trans>}
      actionInProgressText={<Trans>Repaying {symbol}</Trans>}
    />
  );
};
