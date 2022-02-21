import { PoolInterface } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useGasStation } from 'src/hooks/useGasStation';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { RightHelperText } from '../FlowCommons/RightHelperText';
import { GasOption } from '../GasStation/GasStationProvider';
import { TxActionsWrapper } from '../TxActionsWrapper';
import { getEmodeMessage } from './EmodeNaming';

export type EmodeActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  selectedEmode: number;
};

export const EmodeActions = ({ isWrongNetwork, blocked, selectedEmode }: EmodeActionsProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const { action, loadingTxns, mainTxState } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      const newPool: PoolInterface = lendingPool as PoolInterface;
      return newPool.setUserEMode({
        user: currentAccount,
        categoryId: selectedEmode,
      });
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: blocked,
    deps: [selectedEmode],
  });

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      preparingTransactions={loadingTxns}
      handleAction={action}
      actionText={
        selectedEmode !== 0 ? (
          <Trans>SWITCH TO E-MODE {getEmodeMessage(selectedEmode)}</Trans>
        ) : (
          <Trans>DISABLE E-MODE</Trans>
        )
      }
      actionInProgressText={
        selectedEmode !== 0 ? (
          <Trans>SWITCHING TO E-MODE {getEmodeMessage(selectedEmode)}</Trans>
        ) : (
          <Trans>DISABLING E-MODE</Trans>
        )
      }
      isWrongNetwork={isWrongNetwork}
      helperText={
        <RightHelperText
          actionHash={mainTxState.txHash}
          chainId={connectedChainId}
          action="E-Mode switch"
        />
      }
    />
  );
};
