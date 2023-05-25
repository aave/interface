import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { utils } from 'ethers';
import { updatePythPriceTx } from 'src/helpers/pythHelpers';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { permitByChainAndToken } from 'src/ui-config/permitConfig';

import { useTransactionHandler } from '../../../helpers/useTransactionHandler';
import { TxActionsWrapper } from '../TxActionsWrapper';

export interface SupplyActionProps extends BoxProps {
  amountToSupply: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  poolAddress: string;
  symbol: string;
  blocked: boolean;
  updateData: string[];
}

export const SupplyActions = ({
  amountToSupply,
  poolAddress,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
  updateData,
  ...props
}: SupplyActionProps) => {
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const supply = useRootStore((state) => state.supply);
  const supplyWithPermit = useRootStore((state) => state.supplyWithPermit);

  const { approval, action, requiresApproval, loadingTxns, approvalTxState, mainTxState } =
    useTransactionHandler({
      // TODO: move tryPermit
      tryPermit:
        currentMarketData.v3 && permitByChainAndToken[chainId]?.[utils.getAddress(poolAddress)],
      handleGetTxns: async () => {
        return supply({
          amountToSupply,
          isWrongNetwork,
          poolAddress,
          symbol,
          blocked,
          updateData,
        });
      },
      handleGetPermitTxns: async (signature, deadline) => {
        return supplyWithPermit({
          reserve: poolAddress,
          amount: amountToSupply,
          signature,
          deadline,
        });
      },
      skip: !amountToSupply || parseFloat(amountToSupply) === 0,
      deps: [amountToSupply, poolAddress],
    });

  const sequentialtxs = () => updatePythPriceTx(updateData).then(action);

  return (
    <TxActionsWrapper
      blocked={blocked}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      requiresAmount
      amount={amountToSupply}
      preparingTransactions={loadingTxns}
      actionText={<Trans>Update Price & Supply {symbol}</Trans>}
      actionInProgressText={<Trans>Supplying {symbol}</Trans>}
      handleApproval={() => approval(amountToSupply, poolAddress)}
      handleAction={sequentialtxs}
      requiresApproval={requiresApproval}
      sx={sx}
      {...props}
    />
  );
};
