import { EthereumTransactionTypeExtended, GasType } from '@aave/contract-helpers';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useGasStation } from 'src/hooks/useGasStation';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { GasOption } from '../GasStation/GasStationProvider';
import { RightHelperText } from '../FlowCommons/RightHelperText';
import { Box, Button, CircularProgress } from '@mui/material';
import { Trans } from '@lingui/macro';
import { DelegationType, TxState } from 'src/helpers/types';
import { DelegationToken } from 'src/ui-config/governanceConfig';
import { useGovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';

export type GovDelegationActionsProps = {
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  setTxState: Dispatch<SetStateAction<TxState>>;
  handleClose: () => void;
  isWrongNetwork: boolean;
  blocked: boolean;
  delegationType: DelegationType;
  delegationToken: DelegationToken;
  delegate: string;
};

export const GovDelegationActions = ({
  setGasLimit,
  setTxState,
  handleClose,
  isWrongNetwork,
  blocked,
  delegationType,
  delegationToken,
  delegate,
}: GovDelegationActionsProps) => {
  const { governanceDelegationService } = useGovernanceDataProvider();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const { action, loading, mainTxState, actionTx } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      const tx: EthereumTransactionTypeExtended[] =
        await governanceDelegationService.delegateByType({
          user: currentAccount,
          delegatee: delegate,
          delegationType,
          governanceToken: delegationToken.address,
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
    deps: [delegate, delegationToken, delegationType],
  });

  useEffect(() => {
    setTxState({
      success: !!mainTxState.txHash,
      txError: mainTxState.txError,
      gasEstimationError: mainTxState.gasEstimationError,
    });
  }, [setTxState, mainTxState]);

  const handleButtonStates = () => {
    if (loading && !actionTx) {
      return (
        <>
          {!blocked && <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />}
          <Trans>DELEGATE</Trans>
        </>
      );
    } else if (!loading && (actionTx || blocked)) {
      return <Trans>DELEGATE</Trans>;
    } else if (loading && actionTx) {
      return (
        <>
          <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
          <Trans>DELEGATE PENDING...</Trans>
        </>
      );
    } else if (!loading && !actionTx) {
      return <Trans>DELEGATE</Trans>;
    }
  };

  // TODO: hash link not working
  return (
    <Box sx={{ mt: '16px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <RightHelperText
          actionHash={mainTxState.txHash}
          chainId={connectedChainId}
          action="withdraw"
        />
      </Box>
      {!mainTxState.txHash && !mainTxState.txError && (
        <Button
          variant="contained"
          onClick={action}
          disabled={loading || isWrongNetwork || blocked || !!mainTxState.gasEstimationError}
        >
          {handleButtonStates()}
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
