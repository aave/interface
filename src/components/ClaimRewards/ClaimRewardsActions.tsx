import { EthereumTransactionTypeExtended, GasType } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress } from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { Reward, TxState } from 'src/helpers/types';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useGasStation } from 'src/hooks/useGasStation';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { RightHelperText } from '../FlowCommons/RightHelperText';
import { GasOption } from '../GasStation/GasStationProvider';

export type ClaimRewardsActionsProps = {
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  setClaimRewardsTxState: Dispatch<SetStateAction<TxState>>;
  handleClose: () => void;
  isWrongNetwork: boolean;
  blocked: boolean;
  selectedReward: Reward;
};

export const ClaimRewardsActions = ({
  setGasLimit,
  setClaimRewardsTxState,
  handleClose,
  isWrongNetwork,
  blocked,
  selectedReward,
}: ClaimRewardsActionsProps) => {
  const { incentivesTxBuilderV2, incentivesTxBuilder } = useTxBuilderContext();
  const { currentMarketData } = useProtocolDataContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const { action, loading, mainTxState, actionTx } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      let tx: EthereumTransactionTypeExtended[];
      if (currentMarketData.v3) {
        if (selectedReward.symbol === 'all') {
          tx = incentivesTxBuilderV2.claimAllRewards({
            user: currentAccount,
            assets: selectedReward.assets,
            to: currentAccount,
            incentivesControllerAddress: selectedReward.incentiveControllerAddress,
          });
        } else {
          tx = incentivesTxBuilderV2.claimRewards({
            user: currentAccount,
            assets: selectedReward.assets,
            to: currentAccount,
            incentivesControllerAddress: selectedReward.incentiveControllerAddress,
            reward: selectedReward.rewardTokenAddress,
          });
        }
      } else {
        tx = incentivesTxBuilder.claimRewards({
          user: currentAccount,
          assets: selectedReward.assets,
          to: currentAccount,
          incentivesControllerAddress: selectedReward.incentiveControllerAddress,
        });
      }

      const gas: GasType | null = await tx[tx.length - 1].gas();
      setGasLimit(gas?.gasLimit);
      return tx;
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: Object.keys(selectedReward).length === 0 || blocked,
    deps: [selectedReward],
  });

  useEffect(() => {
    setClaimRewardsTxState({
      success: !!mainTxState.txHash,
      txError: mainTxState.txError,
      gasEstimationError: mainTxState.gasEstimationError,
    });
  }, [setClaimRewardsTxState, mainTxState]);

  const handleButtonStates = () => {
    if (loading && !actionTx) {
      return (
        <>
          {!blocked && <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />}
          <Trans>CLAIM</Trans>{' '}
          {selectedReward.symbol === 'all' ? <Trans>ALL</Trans> : selectedReward.symbol}
        </>
      );
    } else if (!loading && (actionTx || blocked)) {
      return (
        <>
          <Trans>CLAIM</Trans>{' '}
          {selectedReward.symbol === 'all' ? <Trans>ALL</Trans> : selectedReward.symbol}
        </>
      );
    } else if (!loading && !actionTx) {
      return (
        <>
          <Trans>CLAIM</Trans>{' '}
          {selectedReward.symbol === 'all' ? <Trans>ALL</Trans> : selectedReward.symbol}
        </>
      );
    } else if (loading && actionTx) {
      return (
        <>
          <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
          <Trans>CLAIMING</Trans>{' '}
          {selectedReward.symbol === 'all' ? <Trans>ALL</Trans> : selectedReward.symbol}{' '}
          <Trans>PENDING...</Trans>
        </>
      );
    }
  };

  return (
    <Box sx={{ mt: '16px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <RightHelperText
          actionHash={mainTxState.txHash}
          chainId={connectedChainId}
          action="borrow"
        />
      </Box>
      {!mainTxState.txHash && !mainTxState.txError && (
        <Button
          variant="contained"
          onClick={action}
          disabled={loading || isWrongNetwork || blocked || !!mainTxState.gasEstimationError}
        >
          {handleButtonStates()}
        </Button>
      )}
      {(mainTxState.txHash || mainTxState.txError) && (
        <Button onClick={handleClose} variant="contained">
          {!mainTxState.txError && <Trans>OK, </Trans>}
          <Trans>CLOSE</Trans>
        </Button>
      )}
    </Box>
  );
};
