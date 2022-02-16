import { EthereumTransactionTypeExtended, GasType } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Button, CircularProgress } from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { TxState } from 'src/helpers/types';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useGasStation } from 'src/hooks/useGasStation';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { RightHelperText } from '../FlowCommons/RightHelperText';
import { GasOption } from '../GasStation/GasStationProvider';
import { TxActionsWrapper } from '../TxActionsWrapper';

export type FaucetActionsProps = {
  poolReserve: ComputedReserveData;
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  setFaucetTxState: Dispatch<SetStateAction<TxState>>;
  handleClose: () => void;
  isWrongNetwork: boolean;
  blocked: boolean;
};

export const FaucetActions = ({
  poolReserve,
  setGasLimit,
  setFaucetTxState,
  handleClose,
  isWrongNetwork,
  blocked,
}: FaucetActionsProps) => {
  const { faucetService } = useTxBuilderContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const { action, loading, mainTxState } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      const tx: EthereumTransactionTypeExtended[] = await faucetService.mint({
        userAddress: currentAccount,
        tokenSymbol: poolReserve.symbol,
        reserve: poolReserve.underlyingAsset,
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
  });

  useEffect(() => {
    setFaucetTxState({
      success: !!mainTxState.txHash,
      txError: mainTxState.txError,
      gasEstimationError: mainTxState.gasEstimationError,
    });
  }, [setFaucetTxState, mainTxState]);

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      handleClose={handleClose}
      helperText={
        <RightHelperText
          actionHash={mainTxState.txHash}
          chainId={connectedChainId}
          action="collateral change"
        />
      }
    >
      <>
        {!mainTxState.txHash && !mainTxState.txError && (
          <Button
            variant="contained"
            onClick={action}
            disabled={loading || isWrongNetwork || blocked || !!mainTxState.gasEstimationError}
            size="large"
            sx={{ minHeight: '44px' }}
          >
            {!loading ? (
              <>
                <Trans>Faucet</Trans> {poolReserve.symbol}
              </>
            ) : (
              <>
                <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
                <Trans>Pending...</Trans>
              </>
            )}
          </Button>
        )}
      </>
    </TxActionsWrapper>
  );
};
