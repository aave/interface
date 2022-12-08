import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { utils } from 'ethers';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { permitByChainAndToken } from 'src/ui-config/permitConfig';

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
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const repay = useRootStore((state) => state.repay);
  const repayWithPermit = useRootStore((state) => state.repayWithPermit);

  const { approval, action, requiresApproval, loadingTxns, approvalTxState, mainTxState } =
    useTransactionHandler({
      // move tryPermit to store
      tryPermit:
        currentMarketData.v3 &&
        permitByChainAndToken[chainId]?.[utils.getAddress(poolAddress).toLowerCase()],
      handleGetTxns: async () => {
        return repay({
          amountToRepay,
          poolAddress,
          repayWithATokens,
          debtType,
          poolReserve,
          isWrongNetwork,
          symbol,
        });
      },
      handleGetPermitTxns: async (signature, deadline) => {
        return repayWithPermit({
          amountToRepay,
          poolReserve,
          isWrongNetwork,
          poolAddress,
          symbol,
          debtType,
          repayWithATokens,
          signature,
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
