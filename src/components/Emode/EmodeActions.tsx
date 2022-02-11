import { EthereumTransactionTypeExtended, GasType, PoolInterface } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress } from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { TxState } from 'src/helpers/types';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useGasStation } from 'src/hooks/useGasStation';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { RightHelperText } from '../FlowCommons/RightHelperText';
import { GasOption } from '../GasStation/GasStationProvider';
import { getEmodeMessage } from './EmodeNaming';

export type EmodeActionsProps = {
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  setEmodeTxState: Dispatch<SetStateAction<TxState>>;
  handleClose: () => void;
  isWrongNetwork: boolean;
  blocked: boolean;
  selectedEmode: number;
  currentEmode: number;
};

export const EmodeActions = ({
  setGasLimit,
  setEmodeTxState,
  handleClose,
  isWrongNetwork,
  blocked,
  selectedEmode,
  currentEmode,
}: EmodeActionsProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();
  console.log('currentEmode === selectedEmode', currentEmode === selectedEmode);
  const { action, loading, mainTxState, actionTx } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      const newPool: PoolInterface = lendingPool as PoolInterface;
      const tx: EthereumTransactionTypeExtended[] = newPool.setUserEMode({
        user: currentAccount,
        categoryId: 0,
      });

      const gas: GasType | null = await tx[tx.length - 1].gas();
      setGasLimit(gas?.gasLimit);
      return tx;
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: blocked,
    deps: [selectedEmode],
  });

  useEffect(() => {
    setEmodeTxState({
      success: !!mainTxState.txHash,
      txError: mainTxState.txError,
      gasEstimationError: mainTxState.gasEstimationError,
    });
  }, [setEmodeTxState, mainTxState]);

  const getButtonText = () => {
    if (loading && !actionTx) {
      return (
        <>
          {!blocked && <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />}
          {selectedEmode !== 0 ? (
            <>
              <Trans>SWITCH TO E-MODE</Trans> {getEmodeMessage(selectedEmode)}
            </>
          ) : (
            <Trans>DISABLE E-MODE</Trans>
          )}
        </>
      );
    } else if (!loading && (actionTx || blocked)) {
      return (
        <>
          {selectedEmode !== 0 ? (
            <>
              <Trans>SWITCH TO E-MODE</Trans> {getEmodeMessage(selectedEmode)}
            </>
          ) : (
            <Trans>DISABLE E-MODE</Trans>
          )}
        </>
      );
    } else if (!loading && !actionTx) {
      return (
        <>
          {selectedEmode !== 0 ? (
            <>
              <Trans>SWITCH TO E-MODE</Trans> {getEmodeMessage(selectedEmode)}
            </>
          ) : (
            <Trans>DISABLE E-MODE</Trans>
          )}
        </>
      );
    } else if (loading && actionTx) {
      return (
        <>
          <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
          {selectedEmode !== 0 ? (
            <>
              <Trans>SWITCH TO E-MODE</Trans> {getEmodeMessage(selectedEmode)}
            </>
          ) : (
            <Trans>DISABLE E-MODE</Trans>
          )}
        </>
      );
    }
  };

  return (
    <Box sx={{ mt: '16px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <RightHelperText
          actionHash={mainTxState.txHash}
          chainId={connectedChainId}
          action="E-Mode switch"
        />
      </Box>
      {!mainTxState.txHash && !mainTxState.txError && (
        <Button
          variant="contained"
          onClick={action}
          disabled={loading || isWrongNetwork || blocked || !!mainTxState.gasEstimationError}
        >
          {getButtonText()}
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
