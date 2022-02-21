import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useTransactionHandler } from '../../../helpers/useTransactionHandler';
import { useGasStation } from 'src/hooks/useGasStation';
import { GasOption } from '../GasStation/GasStationProvider';
import { RightHelperText } from '../FlowCommons/RightHelperText';
import { useStakeTxBuilderContext } from 'src/hooks/useStakeTxBuilder';
import { TxActionsWrapper } from '../TxActionsWrapper';

export interface StakeCooldownActionsProps extends BoxProps {
  isWrongNetwork: boolean;
  customGasPrice?: string;
  blocked: boolean;
  selectedToken: string;
}

export const StakeCooldownActions = ({
  isWrongNetwork,
  sx,
  blocked,
  selectedToken,
  ...props
}: StakeCooldownActionsProps) => {
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();
  const stakingService = useStakeTxBuilderContext(selectedToken);

  const { action, loadingTxns, mainTxState } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      return stakingService.cooldown(currentAccount);
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: blocked,
    deps: [],
  });

  return (
    <TxActionsWrapper
      preparingTransactions={loadingTxns}
      handleAction={action}
      actionText={<Trans>ACTIVATE COOLDOWN</Trans>}
      actionInProgressText={<Trans>ACTIVATE COOLDOWN</Trans>}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      helperText={
        <RightHelperText
          actionHash={mainTxState.txHash}
          chainId={connectedChainId}
          action="cooldown activation"
        />
      }
      sx={sx}
      {...props}
    />
  );
};
