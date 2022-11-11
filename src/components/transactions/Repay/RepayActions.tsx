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
  asset: string;
  symbol: string;
  debtType: InterestRate;
  repayWithATokens: boolean;
  blocked?: boolean;
}

export const RepayActions = ({
  amountToRepay,
  poolReserve,
  asset,
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
      tryPermit: currentMarketData.v3 && permitByChainAndToken[chainId]?.[utils.getAddress(asset)],
      handleGetTxns: async () => {
        return repay({
          amountToRepay,
          asset,
          repayWithATokens,
          debtType,
          poolReserve,
          isWrongNetwork,
          symbol,
        });
      },
      handleGetPermitTxns: async (signatures, deadline) => {
        return repayWithPermit({
          amountToRepay,
          poolReserve,
          isWrongNetwork,
          asset,
          symbol,
          debtType,
          repayWithATokens,
          signature: signatures[0],
          deadline,
        });
      },
      skip: !amountToRepay || parseFloat(amountToRepay) === 0 || blocked,
      deps: [amountToRepay, asset, repayWithATokens],
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
      handleApproval={() => approval([{ amount: amountToRepay, asset }])}
      actionText={<Trans>Repay {symbol}</Trans>}
      actionInProgressText={<Trans>Repaying {symbol}</Trans>}
    />
  );
};
