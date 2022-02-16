import { ChainId, EthereumTransactionTypeExtended, GasType, Pool } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, BoxProps, Button, CircularProgress } from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useTransactionHandler } from '../../helpers/useTransactionHandler';
import { useGasStation } from 'src/hooks/useGasStation';
import { TxState } from 'src/helpers/types';
import { GasOption } from 'src/components/GasStation/GasStationProvider';
import { LeftHelperText } from 'src/components/FlowCommons/LeftHelperText';
import { RightHelperText } from 'src/components/FlowCommons/RightHelperText';
import { getSwapCallData, useSwap } from 'src/hooks/useSwap';
import { Asset } from 'src/components/AssetInput';

export interface SwapActionProps extends BoxProps {
  amountToSupply: string;
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  setSupplyTxState: Dispatch<SetStateAction<TxState>>;
  customGasPrice?: string;
  handleClose: () => void;
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  targetReserve: Asset;
  symbol: string;
  blocked: boolean;
  max?: boolean;
}

export const SwapActions = ({
  amountToSupply,
  setSupplyTxState,
  handleClose,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
  poolReserve,
  targetReserve,
  max,
  ...props
}: SwapActionProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { chainId: connectedChainId, currentAccount } = useWeb3Context();
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
    handleGetTxns: async () => {
      // if (!priceRoute || error) {
      //   throw new Error('no paraswap route found');
      // }
      // const { swapCallData, augustus } = await getSwapCallData({
      //   srcToken: reserveIn.address,
      //   srcDecimals: reserveIn.decimals,
      //   destToken: reserveOut.address,
      //   destDecimals: reserveOut.decimals,
      //   user: currentAccount,
      //   route: priceRoute,
      //   chainId: connectedChainId,
      // });
      // return lendingPool.swapCollateral({
      //   fromAsset: poolReserve.underlyingAsset,
      //   toAsset: targetReserve.address,
      //   swapAll: !!max,
      //   fromAToken: fromPoolReserve.aTokenAddress,
      //   fromAmount: inputAmount.toString(),
      //   minToAmount: toAmountQuery.toString(),
      //   user: currentAccount,
      //   flash:
      //     user.healthFactor !== '-1' &&
      //     valueToBigNumber(user.healthFactor).minus(hfEffectOfFromAmount).lt(1.01),
      //   augustus,
      //   swapCallData,
      // });
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
    <Box sx={{ display: 'flex', flexDirection: 'column', ...sx }} {...props}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '12px' }}
      >
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
      </Box>
      {(mainTxState.txError || approvalTxState.txError) && (
        <Button variant="outlined" onClick={handleRetry} sx={{ mb: 2 }}>
          <Trans>RETRY WITH APPROVAL</Trans>
        </Button>
      )}
      {!hasAmount && !approvalTxState.txError && (
        <Button variant="outlined" disabled>
          <Trans>ENTER AN AMOUNT</Trans>
        </Button>
      )}
      {hasAmount && requiresApproval && !approved && !approvalTxState.txError && (
        <Button
          variant="contained"
          onClick={() => approval(amountToSupply, poolReserve.underlyingAsset)}
          disabled={
            approved || loading || isWrongNetwork || blocked || !!approvalTxState.gasEstimationError
          }
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
      {hasAmount && !mainTxState.txHash && !mainTxState.txError && !approvalTxState.txError && (
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
          sx={{ mt: !approved ? 2 : 0 }}
        >
          {!mainTxState.txHash && !mainTxState.txError && (!loading || !approved) && (
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
      {(mainTxState.txHash || mainTxState.txError || approvalTxState.txError) && (
        <Button onClick={handleClose} variant="contained">
          {!mainTxState.txError && !approvalTxState.txError && <Trans>OK, </Trans>}
          <Trans>CLOSE</Trans>
        </Button>
      )}
    </Box>
  );
};
