import {
  API_ETH_MOCK_ADDRESS,
  ChainId,
  EthereumTransactionTypeExtended,
  GasType,
  Pool,
} from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
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

export type SupplyActionProps = {
  amountToSupply: string;
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  setSupplyTxState: Dispatch<SetStateAction<TxState>>;
  customGasPrice?: string;
  handleClose: () => void;
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  poolAddress: string;
};

export const SupplyActions = ({
  amountToSupply,
  poolReserve,
  setSupplyTxState,
  handleClose,
  setGasLimit,
  poolAddress,
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
    skip: !amountToSupply || amountToSupply === '0',
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
    <Box sx={{ mt: '16px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          onClick={() => approval(amountToSupply, poolAddress)}
          disabled={approved || loading}
        >
          <Trans>
            {!approved && !loading ? 'APPROVE TO CONTINUE' : ''}
            {!approved && loading
              ? `APPROVING ${
                  poolAddress !== API_ETH_MOCK_ADDRESS.toLowerCase()
                    ? poolReserve.symbol
                    : poolReserve.symbol.substring(1)
                }...`
              : ''}
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
              ? `SUPPLY ${
                  poolAddress !== API_ETH_MOCK_ADDRESS.toLowerCase()
                    ? poolReserve.symbol
                    : poolReserve.symbol.substring(1)
                }`
              : ''}
            {approved && loading
              ? `SUPPLY ${
                  poolAddress !== API_ETH_MOCK_ADDRESS.toLowerCase()
                    ? poolReserve.symbol
                    : poolReserve.symbol.substring(1)
                } PENDING...`
              : ''}
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
