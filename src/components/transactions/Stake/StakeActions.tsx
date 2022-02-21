import { EthereumTransactionTypeExtended, GasType } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps, Button, CircularProgress } from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useTransactionHandler } from '../../../helpers/useTransactionHandler';
import { LeftHelperText } from '../FlowCommons/LeftHelperText';
import { useGasStation } from 'src/hooks/useGasStation';
import { GasOption } from '../GasStation/GasStationProvider';
import { RightHelperText } from '../FlowCommons/RightHelperText';
import { TxState } from 'src/helpers/types';
import { useStakeTxBuilderContext } from 'src/hooks/useStakeTxBuilder';
import { TxActionsWrapper } from '../TxActionsWrapper';

export interface StakeActionProps extends BoxProps {
  amountToStake: string;
  isWrongNetwork: boolean;
  setTxState: Dispatch<SetStateAction<TxState>>;
  customGasPrice?: string;
  handleClose: () => void;
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  symbol: string;
  blocked: boolean;
  selectedToken: string;
}

export const StakeActions = ({
  amountToStake,
  setTxState,
  handleClose,
  setGasLimit,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
  selectedToken,
  ...props
}: StakeActionProps) => {
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();
  const stakingService = useStakeTxBuilderContext(selectedToken);

  const { approval, approved, action, requiresApproval, loading, approvalTxState, mainTxState } =
    useTransactionHandler({
      tryPermit: false,
      handleGetTxns: async () => {
        const tx: EthereumTransactionTypeExtended[] = await stakingService.stake(
          currentAccount,
          amountToStake.toString()
        );
        const gas: GasType | null = await tx[tx.length - 1].gas();
        setGasLimit(gas?.gasLimit);
        return tx;
      },
      customGasPrice:
        state.gasOption === GasOption.Custom
          ? state.customGas
          : gasPriceData.data?.[state.gasOption].legacyGasPrice,
      skip: !amountToStake || parseFloat(amountToStake) === 0 || blocked,
      deps: [amountToStake],
    });

  const hasAmount = amountToStake && amountToStake !== '0';

  useEffect(() => {
    setTxState({
      success: !!mainTxState.txHash,
      txError: mainTxState.txError || approvalTxState.txError,
      gasEstimationError: mainTxState.gasEstimationError || approvalTxState.gasEstimationError,
    });
  }, [setTxState, mainTxState, approvalTxState]);

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      handleClose={handleClose}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      hasAmount={hasAmount}
      withAmount
      helperText={
        <>
          <LeftHelperText
            amount={amountToStake}
            error={mainTxState.txError || approvalTxState.txError}
            approvalHash={approvalTxState.txHash}
            actionHash={mainTxState.txHash}
            requiresApproval={requiresApproval}
          />
          <RightHelperText
            approvalHash={approvalTxState.txHash}
            actionHash={mainTxState.txHash}
            chainId={connectedChainId}
            action="stake"
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
            onClick={() => approval()}
            disabled={
              approved ||
              loading ||
              isWrongNetwork ||
              blocked ||
              !!approvalTxState.gasEstimationError
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
              sx={{ mt: !approved ? 2 : 0 }}
            >
              {!mainTxState.txHash && !mainTxState.txError && (!loading || !approved) && (
                <Trans>STAKE {symbol}</Trans>
              )}
              {approved && loading && (
                <>
                  <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
                  <Trans>PENDING...</Trans>
                </>
              )}
            </Button>
          )}
      </>
    </TxActionsWrapper>
  );
};
