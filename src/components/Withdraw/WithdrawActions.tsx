import { ChainId, EthereumTransactionTypeExtended, GasType } from '@aave/contract-helpers';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useGasStation } from 'src/hooks/useGasStation';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { GasOption } from '../GasStation/GasStationProvider';
import { RightHelperText } from '../FlowCommons/RightHelperText';
import { Box, Button, CircularProgress } from '@mui/material';
import { Trans } from '@lingui/macro';
import { TxState } from 'src/helpers/types';

export type WithdrawActionsProps = {
  poolReserve: ComputedReserveData;
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  setWithdrawTxState: Dispatch<SetStateAction<TxState>>;
  amountToWithdraw: string;
  handleClose: () => void;
  poolAddress: string;
  isWrongNetwork: boolean;
  symbol: string;
};

export const WithdrawActions = ({
  poolReserve,
  setGasLimit,
  amountToWithdraw,
  setWithdrawTxState,
  handleClose,
  poolAddress,
  isWrongNetwork,
  symbol,
}: WithdrawActionsProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const { action, loading, mainTxState } = useTransactionHandler({
    tryPermit:
      currentMarketData.v3 && chainId !== ChainId.harmony && chainId !== ChainId.harmony_testnet,
    handleGetTxns: async () => {
      const tx: EthereumTransactionTypeExtended[] = await lendingPool.withdraw({
        user: currentAccount,
        reserve: poolAddress,
        amount: amountToWithdraw.toString(),
        aTokenAddress: poolReserve.aTokenAddress,
      });

      const gas: GasType | null = await tx[tx.length - 1].gas();
      setGasLimit(gas?.gasLimit);
      return tx;
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: !amountToWithdraw || parseFloat(amountToWithdraw) === 0,
    deps: [amountToWithdraw],
  });

  useEffect(() => {
    if (mainTxState.txHash) {
      setWithdrawTxState({
        success: true,
        error: undefined,
      });
    }
  }, [setWithdrawTxState, mainTxState.txHash]);

  const hasAmount = amountToWithdraw && amountToWithdraw !== '0';
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
      {!hasAmount && (
        <Button variant="contained" disabled>
          <Trans>ENTER AN AMOUNT</Trans>
        </Button>
      )}
      {hasAmount && !mainTxState.txHash && !mainTxState.error && (
        <Button variant="contained" onClick={action} disabled={loading || isWrongNetwork}>
          {!loading ? (
            <Trans>WITHDRAW {symbol}</Trans>
          ) : (
            <>
              <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
              <Trans>WITHDRAW {symbol} PENDING...</Trans>
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
