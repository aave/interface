import { ChainId, EthereumTransactionTypeExtended, GasType, Pool } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps, Button, CircularProgress } from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { TxState } from 'src/helpers/types';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useGasStation } from 'src/hooks/useGasStation';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { useTransactionHandler } from '../../../helpers/useTransactionHandler';
import { LeftHelperText } from '../FlowCommons/LeftHelperText';
import { RightHelperText } from '../FlowCommons/RightHelperText';
import { GasOption } from '../GasStation/GasStationProvider';
import { TxActionsWrapper } from '../TxActionsWrapper';

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
  blocked: boolean;
}

export const SupplyActions = ({
  amountToSupply,
  setSupplyTxState,
  handleClose,
  setGasLimit,
  poolAddress,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
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
    setSupplyTxState({
      success: !!mainTxState.txHash,
      txError: mainTxState.txError || approvalTxState.txError,
      gasEstimationError: mainTxState.gasEstimationError || approvalTxState.gasEstimationError,
    });
  }, [setSupplyTxState, mainTxState, approvalTxState]);

  const handleRetry = () => {
    setSupplyTxState({
      txError: undefined,
      success: false,
      gasEstimationError: undefined,
    });
    resetStates();
  };

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      handleClose={handleClose}
      handleRetry={handleRetry}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      hasAmount={hasAmount}
      requiresApproval={requiresApproval}
      withAmount
      helperText={
        <>
          <LeftHelperText
            amount={amountToSupply}
            error={mainTxState.txError || approvalTxState.txError}
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
        </>
      }
      sx={sx}
      {...props}
    >
      <>
        {hasAmount && requiresApproval && !approved && !approvalTxState.txError && !isWrongNetwork && (
          <Button
            variant="contained"
            onClick={() => approval(amountToSupply, poolAddress)}
            disabled={
              approved ||
              loading ||
              isWrongNetwork ||
              blocked ||
              !!approvalTxState.gasEstimationError
            }
            size="large"
            sx={{ minHeight: '44px', mb: 2 }}
          >
            {!loading && <Trans>Approve to continue</Trans>}
            {loading && (
              <>
                <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
                {approvalTxState.loading ? (
                  <Trans>Approving {symbol}...</Trans>
                ) : (
                  <Trans>Approve to continue</Trans>
                )}
              </>
            )}
          </Button>
        )}

        {hasAmount &&
          !mainTxState.txHash &&
          !mainTxState.txError &&
          !approvalTxState.txError &&
          !isWrongNetwork && (
            <Button
              variant="contained"
              onClick={action}
              disabled={
                loading ||
                (requiresApproval && !approved) ||
                isWrongNetwork ||
                blocked ||
                !!mainTxState.gasEstimationError
              }
              size="large"
              sx={{ minHeight: '44px' }}
            >
              {!loading && <Trans>Supply {symbol}</Trans>}
              {loading && (
                <>
                  {((approved && requiresApproval) || !requiresApproval) && (
                    <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
                  )}
                  <Trans>Supply {symbol}</Trans>
                </>
              )}
            </Button>
          )}
      </>
    </TxActionsWrapper>
  );
};
