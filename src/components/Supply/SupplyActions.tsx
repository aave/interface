import { ChainId, Pool } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { TxState } from './SupplyModalContent';
import { useTransactionHandler } from './useTransactionHandler';
import { LeftHelperText } from './LeftHelperText';
import { RightHelperText } from './RightHelperText';

export type SupplyActionProps = {
  amountToSupply: string;
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  setSupplyTxState: Dispatch<SetStateAction<TxState>>;
  customGasPrice?: string;
  handleClose: () => void;
};

export enum SupplyState {
  amountInput = 0,
  approval,
  sendTx,
  success,
  error,
}

export const SupplyActions = ({
  amountToSupply,
  poolReserve,
  setSupplyTxState,
  customGasPrice,
  handleClose,
}: SupplyActionProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();

  const {
    approval,
    approved,
    action,
    requiresApproval,
    loading,
    setUsePermit,
    approvalTxState,
    mainTxState,
    usePermit,
  } = useTransactionHandler({
    tryPermit:
      currentMarketData.v3 && chainId !== ChainId.harmony && chainId !== ChainId.harmony_testnet,
    handleGetTxns: async () => {
      if (currentMarketData.v3) {
        // TO-DO: No need for this cast once a single Pool type is used in use-tx-builder-context
        const newPool: Pool = lendingPool as Pool;
        return await newPool.supply({
          user: currentAccount,
          reserve: poolReserve.underlyingAsset,
          amount: amountToSupply,
        });
      } else {
        return await lendingPool.deposit({
          user: currentAccount,
          reserve: poolReserve.underlyingAsset,
          amount: amountToSupply,
        });
      }
    },
    handleGetPermitTxns: async (signature) => {
      const newPool: Pool = lendingPool as Pool;
      return await newPool.supplyWithPermit({
        user: currentAccount,
        reserve: poolReserve.underlyingAsset,
        amount: amountToSupply,
        signature,
      });
    },
    customGasPrice,
    skip: !amountToSupply || amountToSupply === '0',
  });

  const hasAmount = amountToSupply && amountToSupply !== '0';

  useEffect(() => {
    if (mainTxState.txHash) {
      setSupplyTxState({
        success: true,
        error: null,
      });
    }
  }, [setSupplyTxState, mainTxState.txHash]);

  useEffect(() => {
    if (mainTxState.error || approvalTxState.error) {
      setSupplyTxState({
        success: true,
        error: mainTxState.error || approvalTxState.error,
      });
    }
  }, [setSupplyTxState, mainTxState.error, approvalTxState.error]);

  return (
    <Box sx={{ mt: '16px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <LeftHelperText
          amountToSupply={amountToSupply}
          error={mainTxState.error || approvalTxState.error}
          approvalHash={approvalTxState.txHash}
          actionHash={mainTxState.txHash}
        />
        <RightHelperText
          approvalHash={approvalTxState.txHash}
          actionHash={mainTxState.txHash}
          chainId={connectedChainId}
          usePermit={usePermit}
        />
      </Box>
      {(mainTxState.error || approvalTxState.error) && (
        <Button variant="outlined" onClick={() => setUsePermit(false)}>
          <Trans>RETRY WITH APPROVAL</Trans>
        </Button>
      )}
      {!hasAmount && (
        <Button variant="outlined" disabled>
          <Trans>ENTER AN AMOUNT</Trans>
        </Button>
      )}
      {hasAmount && requiresApproval && !approved && (
        <Button
          variant="outlined"
          onClick={() => approval(amountToSupply, poolReserve.underlyingAsset)}
          disabled={approved || loading}
        >
          <Trans>
            {!approved && !loading ? 'APPROVE TO CONTINUE' : ''}
            {!approved && loading ? `APPROVING ${poolReserve.symbol}...` : ''}
          </Trans>
        </Button>
      )}
      {hasAmount && !mainTxState.txHash && !mainTxState.error && (
        <Button
          variant="outlined"
          onClick={action}
          disabled={loading || (requiresApproval && !approved)}
        >
          <Trans>
            {!mainTxState.txHash && !mainTxState.error && (!loading || !approved)
              ? `SUPPLY ${poolReserve.symbol}`
              : ''}
            {approved && loading ? `SUPPLY ${poolReserve.symbol} PENDING...` : ''}
          </Trans>
        </Button>
      )}
      {(mainTxState.txHash || mainTxState.error || approvalTxState.error) && (
        <Button onClick={handleClose} variant="outlined">
          <Trans>OK, CLOSE</Trans>
        </Button>
      )}
    </Box>
  );
};
