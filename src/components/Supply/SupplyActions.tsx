import { ChainId, EthereumTransactionTypeExtended, GasType, Pool } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, BoxProps, Button, CircularProgress } from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useTransactionHandler } from '../../helpers/useTransactionHandler';
import { LeftHelperText } from '../FlowCommons/LeftHelperText';
import { useGasStation } from 'src/hooks/useGasStation';
import { GasOption } from '../GasStation/GasStationProvider';
import { RightHelperText } from '../FlowCommons/RightHelperText';
import { TxState } from 'src/helpers/types';

export interface SupplyActionProps extends BoxProps {
  amountToSupply: string;
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  setSupplyTxState: Dispatch<SetStateAction<TxState>>;
  customGasPrice?: string;
  handleClose: () => void;
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  poolAddress: string;
  symbol: string;
}

export const SupplyActions = ({
  amountToSupply,
  poolReserve,
  setSupplyTxState,
  handleClose,
  setGasLimit,
  poolAddress,
  isWrongNetwork,
  sx,
  symbol,
  ...props
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
          reserve: poolAddress,
          amount: amountToSupply,
        });
        const gas: GasType | null = await tx[tx.length - 1].gas();
        setGasLimit(gas?.gasLimit);
        return tx;
      } else {
        const tx = await lendingPool.deposit({
          user: currentAccount,
          reserve: poolAddress,
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
        reserve: poolAddress,
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
    skip: !amountToSupply || parseFloat(amountToSupply) === 0,
    deps: [amountToSupply],
  });

  const hasAmount = amountToSupply && amountToSupply !== '0';

  useEffect(() => {
    if (mainTxState.txHash) {
      setSupplyTxState({
        success: true,
        error: undefined,
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
      error: undefined,
      success: false,
    });
    resetStates();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', ...sx }} {...props}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '12px' }}
      >
        <LeftHelperText
          amount={amountToSupply}
          error={mainTxState.error || approvalTxState.error}
          approvalHash={approvalTxState.txHash}
          actionHash={mainTxState.txHash}
          requiresApproval={requiresApproval}
        />
        <RightHelperText
          approvalHash={approvalTxState.txHash}
          actionHash={mainTxState.txHash}
          chainId={connectedChainId}
          usePermit={usePermit}
          action="supply"
        />
      </Box>
      {(mainTxState.error || approvalTxState.error) && (
        <Button variant="outlined" onClick={handleRetry} sx={{ mb: 2 }}>
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
          variant="contained"
          onClick={() => approval(amountToSupply, poolAddress)}
          disabled={approved || loading || isWrongNetwork}
        >
          {!approved && !loading && <Trans>APPROVE TO CONTINUE</Trans>}
          {!approved && loading && (
            <>
              <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
              <Trans>APPROVING {symbol} ...</Trans>
            </>
          )}
        </Button>
      )}
      {hasAmount && !mainTxState.txHash && !mainTxState.error && !approvalTxState.error && (
        <Button
          variant="contained"
          onClick={action}
          disabled={loading || (requiresApproval && !approved) || isWrongNetwork}
          sx={{ mt: !approved ? 2 : 0 }}
        >
          {!mainTxState.txHash && !mainTxState.error && (!loading || !approved) && (
            <Trans>SUPPLY {symbol}</Trans>
          )}
          {approved && loading && (
            <>
              <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
              <Trans>PENDING...</Trans>
            </>
          )}
        </Button>
      )}
      {(mainTxState.txHash || mainTxState.error || approvalTxState.error) && (
        <Button onClick={handleClose} variant="contained">
          {!mainTxState.error && !approvalTxState.error && <Trans>OK, </Trans>}
          <Trans>CLOSE</Trans>
        </Button>
      )}
    </Box>
  );
};
