import { EthereumTransactionTypeExtended, GasType } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress } from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { TxState } from 'src/helpers/types';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useGovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';
import { useGasStation } from 'src/hooks/useGasStation';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { RightHelperText } from '../FlowCommons/RightHelperText';
import { GasOption } from '../GasStation/GasStationProvider';

export type GovVoteActionsProps = {
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  setTxState: Dispatch<SetStateAction<TxState>>;
  handleClose: () => void;
  isWrongNetwork: boolean;
  blocked: boolean;
  proposalId: number;
  support: boolean;
};

export const GovVoteActions = ({
  setGasLimit,
  setTxState,
  handleClose,
  isWrongNetwork,
  blocked,
  proposalId,
  support,
}: GovVoteActionsProps) => {
  const { governanceService } = useGovernanceDataProvider();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const { action, loading, mainTxState } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      const tx: EthereumTransactionTypeExtended[] = await governanceService.submitVote({
        proposalId: Number(proposalId),
        user: currentAccount,
        support,
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
          {loading ? (
            <>
              <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
              <Trans>VOTE</Trans> {support ? 'YAE' : 'NAY'}
            </>
          ) : (
            <>
              <Trans>VOTE</Trans> {support ? 'YAE' : 'NAY'}
            </>
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
