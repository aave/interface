import { ChainId, EthereumTransactionTypeExtended, GasType, Pool } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { TxState } from './SupplyModalContent';
import { useTransactionHandler } from './useTransactionHandler';
import { LeftHelperText } from './LeftHelperText';
import { RightHelperText } from './RightHelperText';
import { useGasStation } from 'src/hooks/useGasStation';
import { GasOption } from '../GasStation/GasStationProvider';

export type SupplyActionProps = {
  amountToSupply: string;
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  setSupplyTxState: Dispatch<SetStateAction<TxState>>;
  customGasPrice?: string;
  handleClose: () => void;
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
};

export const SupplyActions = ({
  amountToSupply,
  poolReserve,
  setSupplyTxState,
  handleClose,
  setGasLimit,
}: SupplyActionProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const {
    approval,
    approved,
    action,
    requiresApproval,
    loading,
    approvalTxState,
    mainTxState,
    usePermit,
    resetStates,
  } = useTransactionHandler({
    tryPermit:
      currentMarketData.v3 && chainId !== ChainId.harmony && chainId !== ChainId.harmony_testnet,
    handleGetTxns: async () => {
      if (currentMarketData.v3) {
        // TO-DO: No need for this cast once a single Pool type is used in use-tx-builder-context
        const newPool: Pool = lendingPool as Pool;
        const tx: EthereumTransactionTypeExtended[] = await newPool.supply({
          user: currentAccount,
          reserve: poolReserve.underlyingAsset,
          amount: amountToSupply,
        });
        const gas: GasType | null = await tx[tx.length - 1].gas();
        setGasLimit(gas?.gasLimit);
        return tx;
      } else {
        const tx = await lendingPool.deposit({
          user: currentAccount,
          reserve: poolReserve.underlyingAsset,
          amount: amountToSupply,
        });
        const gas: GasType | null = await tx[tx.length - 1].gas();
        setGasLimit(gas?.gasLimit);
        return tx;
      }
    },
    handleGetPermitTxns: async (signature) => {
      const newPool: Pool = lendingPool as Pool;
      const tx = await newPool.supplyWithPermit({
        user: currentAccount,
        reserve: poolReserve.underlyingAsset,
        amount: amountToSupply,
        signature,
      });
      const gas: GasType | null = await tx[tx.length - 1].gas();
      setGasLimit(gas?.gasLimit);
      return tx;
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
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

  const handleRetry = () => {
    setSupplyTxState({
      error: null,
      success: false,
    });
    resetStates();
  };

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
        <Button variant="outlined" onClick={handleRetry}>
          <Trans>RETRY WITH APPROVAL</Trans>
        </Button>
      )}
      {!hasAmount && !approvalTxState.error && (
        <Button variant="outlined" disabled>
          <Trans>ENTER AN AMOUNT</Trans>
        </Button>
      )}
      {hasAmount && requiresApproval && !approved && !approvalTxState.error && (
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
      {hasAmount && !mainTxState.txHash && !mainTxState.error && !approvalTxState.error && (
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
