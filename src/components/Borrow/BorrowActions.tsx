import {
  API_ETH_MOCK_ADDRESS,
  ChainId,
  EthereumTransactionTypeExtended,
  GasType,
  InterestRate,
} from '@aave/contract-helpers';
import { Box, Button, CircularProgress } from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { TxState } from 'src/helpers/types';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useGasStation } from 'src/hooks/useGasStation';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { RightHelperText } from '../FlowCommons/RightHelperText';
import { GasOption } from '../GasStation/GasStationProvider';
import { Trans } from '@lingui/macro';

export type BorrowActionsProps = {
  poolReserve: ComputedReserveData;
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  setBorrowTxState: Dispatch<SetStateAction<TxState>>;
  amountToBorrow: string;
  handleClose: () => void;
  poolAddress: string;
  interestRateMode: InterestRate;
  isWrongNetwork: boolean;
};

export const BorrowActions = ({
  poolReserve,
  setGasLimit,
  amountToBorrow,
  setBorrowTxState,
  handleClose,
  poolAddress,
  interestRateMode,
  isWrongNetwork,
}: BorrowActionsProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const { action, loading, mainTxState } = useTransactionHandler({
    tryPermit:
      currentMarketData.v3 && chainId !== ChainId.harmony && chainId !== ChainId.harmony_testnet,
    handleGetTxns: async () => {
      const tx: EthereumTransactionTypeExtended[] = await lendingPool.borrow({
        interestRateMode,
        user: currentAccount,
        amount: amountToBorrow,
        reserve: poolAddress,
        debtTokenAddress:
          interestRateMode === InterestRate.Variable
            ? poolReserve.variableDebtTokenAddress
            : poolReserve.stableDebtTokenAddress,
      });

      const gas: GasType | null = await tx[tx.length - 1].gas();
      setGasLimit(gas?.gasLimit);
      return tx;
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: !amountToBorrow || amountToBorrow === '0',
  });

  useEffect(() => {
    if (mainTxState.txHash) {
      setBorrowTxState({
        success: true,
        error: undefined,
      });
    }
  }, [setBorrowTxState, mainTxState.txHash]);

  const hasAmount = amountToBorrow && amountToBorrow !== '0';

  return (
    <Box sx={{ mt: '16px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <RightHelperText
          actionHash={mainTxState.txHash}
          chainId={connectedChainId}
          action="borrow"
        />
      </Box>
      {!hasAmount && (
        <Button variant="contained" disabled>
          <Trans>ENTER AN AMOUNT</Trans>
        </Button>
      )}
      {hasAmount && !mainTxState.txHash && !mainTxState.error && (
        <Button variant="contained" onClick={action} disabled={loading || isWrongNetwork}>
          {!loading ? (
            <Trans>
              BORROW{' '}
              {poolAddress !== API_ETH_MOCK_ADDRESS
                ? poolReserve.symbol
                : poolReserve.symbol.substring(1)}
            </Trans>
          ) : (
            <>
              <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
              <Trans>
                BORROW{' '}
                {poolAddress !== API_ETH_MOCK_ADDRESS
                  ? poolReserve.symbol
                  : poolReserve.symbol.substring(1)}{' '}
                PENDING...
              </Trans>
            </>
          )}
        </Button>
      )}
      {(mainTxState.txHash || mainTxState.error) && (
        <Button onClick={handleClose} variant="contained">
          <Trans>OK, CLOSE</Trans>
        </Button>
      )}
    </Box>
  );
};
