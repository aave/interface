import { EthereumTransactionTypeExtended, GasType, InterestRate } from '@aave/contract-helpers';
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

export type RateSwitchActionsProps = {
  poolReserve: ComputedReserveData;
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  setRateSwitchTxState: Dispatch<SetStateAction<TxState>>;
  handleClose: () => void;
  isWrongNetwork: boolean;
  currentRateMode: InterestRate;
  blocked: boolean;
};

export const RateSwitchActions = ({
  poolReserve,
  setGasLimit,
  setRateSwitchTxState,
  handleClose,
  isWrongNetwork,
  currentRateMode,
  blocked,
}: RateSwitchActionsProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const { action, loading, mainTxState } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      const tx: EthereumTransactionTypeExtended[] = await lendingPool.swapBorrowRateMode({
        user: currentAccount,
        reserve: poolReserve.underlyingAsset,
        interestRateMode: currentRateMode,
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
    setRateSwitchTxState({
      success: !!mainTxState.txHash,
      txError: mainTxState.txError,
      gasEstimationError: mainTxState.gasEstimationError,
    });
  }, [setRateSwitchTxState, mainTxState]);

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
            sx={{ minHeight: '44px' }}
          >
            {!loading || blocked ? (
              <Trans>Switch rate</Trans>
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
