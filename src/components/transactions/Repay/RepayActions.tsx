import { InterestRate, Pool } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { utils } from 'ethers';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { permitByChainAndToken } from 'src/ui-config/permitConfig';
import { optimizedPath } from 'src/utils/utils';
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
  blocked?: boolean;
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
  const { currentAccount } = useWeb3Context();

  const { approval, action, requiresApproval, loadingTxns, approvalTxState, mainTxState } =
    useTransactionHandler({
      tryPermit:
        currentMarketData.v3 && permitByChainAndToken[chainId]?.[utils.getAddress(poolAddress)],
      handleGetTxns: async () => {
        if (currentMarketData.v3) {
          const newPool: Pool = lendingPool as Pool;
          if (repayWithATokens) {
            return newPool.repayWithATokens({
              user: currentAccount,
              reserve: poolAddress,
              amount: amountToRepay,
              rateMode: debtType as InterestRate,
              useOptimizedPath: optimizedPath(chainId),
            });
          } else {
            return newPool.repay({
              user: currentAccount,
              reserve: poolAddress,
              amount: amountToRepay,
              interestRateMode: debtType,
              useOptimizedPath: optimizedPath(chainId),
            });
          }
        } else {
          return lendingPool.repay({
            user: currentAccount,
            reserve: poolAddress,
            amount: amountToRepay,
            interestRateMode: debtType,
          });
        }
      },
      handleGetPermitTxns: async (signature, deadline) => {
        const newPool: Pool = lendingPool as Pool;
        return newPool.repayWithPermit({
          user: currentAccount,
          reserve: poolAddress,
          amount: amountToRepay, // amountToRepay.toString(),
          interestRateMode: debtType,
          signature,
          useOptimizedPath: optimizedPath(chainId),
          deadline,
        });
      },
      skip: !amountToRepay || parseFloat(amountToRepay) === 0 || blocked,
      deps: [amountToRepay, poolAddress, repayWithATokens],
    });

  return (
    <TxActionsWrapper
      blocked={blocked}
      preparingTransactions={loadingTxns}
      symbol={poolReserve.symbol}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      requiresAmount
      amount={amountToRepay}
      requiresApproval={requiresApproval}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
      handleAction={action}
      handleApproval={() => approval(amountToRepay, poolAddress)}
      actionText={<Trans>Repay {symbol}</Trans>}
      actionInProgressText={<Trans>Repaying {symbol}</Trans>}
    />
  );
};
