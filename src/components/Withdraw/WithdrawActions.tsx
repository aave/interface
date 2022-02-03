import {
  API_ETH_MOCK_ADDRESS,
  ChainId,
  EthereumTransactionTypeExtended,
  GasType,
} from '@aave/contract-helpers';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useGasStation } from 'src/hooks/useGasStation';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { GasOption } from '../GasStation/GasStationProvider';
import { RightHelperText } from '../FlowCommons/RightHelperText';
import { Box, Button } from '@mui/material';
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
};

export const WithdrawActions = ({
  poolReserve,
  setGasLimit,
  amountToWithdraw,
  setWithdrawTxState,
  handleClose,
  poolAddress,
  isWrongNetwork,
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
    skip: !amountToWithdraw || amountToWithdraw === '0',
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
        <Button variant="outlined" disabled>
          <Trans>ENTER AN AMOUNT</Trans>
        </Button>
      )}
      {hasAmount && !mainTxState.txHash && !mainTxState.error && (
        <Button variant="outlined" onClick={action} disabled={loading || isWrongNetwork}>
          <Trans>
            {!loading
              ? `WITHDRAW ${
                  poolAddress !== API_ETH_MOCK_ADDRESS
                    ? poolReserve.symbol
                    : poolReserve.symbol.substring(1)
                }`
              : `WITHDRAW ${
                  poolAddress !== API_ETH_MOCK_ADDRESS
                    ? poolReserve.symbol
                    : poolReserve.symbol.substring(1)
                } PENDING...`}
          </Trans>
        </Button>
      )}
      {(mainTxState.txHash || mainTxState.error) && (
        <Button onClick={handleClose} variant="outlined">
          <Trans>OK, CLOSE</Trans>
        </Button>
      )}
    </Box>
  );
};
