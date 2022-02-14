import { EthereumTransactionTypeExtended, GasType } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, BoxProps, Button, CircularProgress } from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useTransactionHandler } from '../../helpers/useTransactionHandler';
import { useGasStation } from 'src/hooks/useGasStation';
import { GasOption } from '../GasStation/GasStationProvider';
import { RightHelperText } from '../FlowCommons/RightHelperText';
import { TxState } from 'src/helpers/types';
import { useStakeTxBuilderContext } from 'src/hooks/useStakeTxBuilder';

export interface StakeCooldownActionsProps extends BoxProps {
  isWrongNetwork: boolean;
  setTxState: Dispatch<SetStateAction<TxState>>;
  customGasPrice?: string;
  handleClose: () => void;
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  blocked: boolean;
  selectedToken: string;
}

export const StakeCooldownActions = ({
  setTxState,
  handleClose,
  setGasLimit,
  isWrongNetwork,
  sx,
  blocked,
  selectedToken,
  ...props
}: StakeCooldownActionsProps) => {
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();
  const stakingService = useStakeTxBuilderContext(selectedToken);

  const { action, loading, mainTxState } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      const tx: EthereumTransactionTypeExtended[] = stakingService.cooldown(currentAccount);
      const gas: GasType | null = await tx[tx.length - 1].gas();
      setGasLimit(gas?.gasLimit);
      return tx;
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: blocked,
    deps: [],
  });

  useEffect(() => {
    setTxState({
      success: !!mainTxState.txHash,
      txError: mainTxState.txError,
      gasEstimationError: mainTxState.gasEstimationError,
    });
  }, [setTxState, mainTxState]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', ...sx }} {...props}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '12px' }}
      >
        <RightHelperText
          actionHash={mainTxState.txHash}
          chainId={connectedChainId}
          action="cooldown activation"
        />
      </Box>
      {!mainTxState.txHash && !mainTxState.txError && (
        <Button
          variant="contained"
          onClick={action}
          disabled={loading || isWrongNetwork || blocked || !!mainTxState.gasEstimationError}
        >
          {loading ? (
            <>
              <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
              <Trans>ACTIVATE COOLDOWN</Trans>
            </>
          ) : (
            <Trans>ACTIVATE COOLDOWN</Trans>
          )}
        </Button>
      )}
      {(mainTxState.txHash || mainTxState.txError) && (
        <Button onClick={handleClose} variant="contained">
          {!mainTxState.txError && <Trans>OK, </Trans>}
          <Trans>CLOSE</Trans>
        </Button>
      )}
    </Box>
  );
};
