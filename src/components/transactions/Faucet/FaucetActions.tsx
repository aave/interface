import { Trans } from '@lingui/macro';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useGasStation } from 'src/hooks/useGasStation';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { RightHelperText } from '../FlowCommons/RightHelperText';
import { GasOption } from '../GasStation/GasStationProvider';
import { TxActionsWrapper } from '../TxActionsWrapper';

export type FaucetActionsProps = {
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  blocked: boolean;
};

export const FaucetActions = ({ poolReserve, isWrongNetwork, blocked }: FaucetActionsProps) => {
  const { faucetService } = useTxBuilderContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const { action, loadingTxns, mainTxState } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      return faucetService.mint({
        userAddress: currentAccount,
        tokenSymbol: poolReserve.symbol,
        reserve: poolReserve.underlyingAsset,
      });
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: blocked,
  });

  return (
    <TxActionsWrapper
      preparingTransactions={loadingTxns}
      handleAction={action}
      actionText={<Trans>Faucet {poolReserve.symbol}</Trans>}
      actionInProgressText={<Trans>Pending...</Trans>}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      helperText={
        <RightHelperText
          actionHash={mainTxState.txHash}
          chainId={connectedChainId}
          action="faucet"
        />
      }
    />
  );
};
