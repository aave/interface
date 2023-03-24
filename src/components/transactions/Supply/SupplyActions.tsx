import { ApproveType } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { useBackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';

import { TxActionsWrapper } from '../TxActionsWrapper';

export interface SupplyActionProps extends BoxProps {
  amountToSupply: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  poolAddress: string;
  symbol: string;
  blocked: boolean;
  decimals: number;
}

export const SupplyActions = React.memo(
  ({
    amountToSupply,
    poolAddress,
    isWrongNetwork,
    sx,
    symbol,
    blocked,
    decimals,
    ...props
  }: SupplyActionProps) => {
    const {
      tryPermit,
      supply,
      supplyWithPermit,
      getApprovedAmount,
      generateSignatureRequest,
      generateApproval,
      walletApprovalMethodPreference,
    } = useRootStore();
    const {
      approvalTxState,
      mainTxState,
      loadingTxns,
      setLoadingTxns,
      setApprovalTxState,
      setMainTxState,
      setTxError,
    } = useModalContext();
    const { refetchWalletBalances, refetchPoolData, refetchIncentiveData } =
      useBackgroundDataProvider();
    const permitAvailable = tryPermit(poolAddress);
    const { signTxData, sendTx } = useWeb3Context();

    const [usePermit, setUsePermit] = useState(false);
    const [approvedAmount, setApprovedAmount] = useState<ApproveType | undefined>();
    const [requiresApproval, setRequiresApproval] = useState<boolean>(false);
    const [signature, setSignature] = useState<SignatureLike | undefined>();

    const fetchApprovedAmount = useCallback(async () => {
      if (!approvedAmount) {
        setLoadingTxns(true);
        const approvedAmount = await getApprovedAmount({ token: poolAddress });
        setApprovedAmount(approvedAmount);

        //TODO: more logic here
        if (approvedAmount.amount !== '0') {
          setRequiresApproval(false);
        } else {
          setRequiresApproval(true);
        }
      }
      setLoadingTxns(false);
    }, [approvedAmount, getApprovedAmount, poolAddress, setLoadingTxns]);

    useEffect(() => {
      fetchApprovedAmount();
    }, [fetchApprovedAmount]);

    useEffect(() => {
      const preferPermit =
        permitAvailable && walletApprovalMethodPreference === ApprovalMethod.PERMIT;
      setUsePermit(preferPermit);
    }, [permitAvailable, walletApprovalMethodPreference]);

    const approval = async () => {
      try {
        if (requiresApproval && approvedAmount) {
          if (usePermit) {
            const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
            const signatureRequest = await generateSignatureRequest({
              ...approvedAmount,
              deadline,
              amount: parseUnits(amountToSupply, decimals).toString(),
            });

            const response = await signTxData(signatureRequest);
            setSignature(response);
            setApprovalTxState({
              txHash: MOCK_SIGNED_HASH,
              loading: false,
              success: true,
            });
          } else {
            const approveTxData = generateApproval(approvedAmount);

            setApprovalTxState({ ...approvalTxState, loading: true });
            const response = await sendTx(approveTxData);
            setApprovalTxState({
              txHash: response.hash,
              loading: false,
              success: true,
            });
          }
        }
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setApprovalTxState({
          txHash: undefined,
          loading: false,
        });
      }
    };

    const action = async () => {
      try {
        setMainTxState({ ...mainTxState, loading: true });
        if (requiresApproval && usePermit && signature) {
          const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
          const signedTxData = supplyWithPermit({
            signature,
            amount: parseUnits(amountToSupply, decimals).toString(),
            reserve: poolAddress,
            deadline,
          });

          const response = await sendTx(signedTxData);
          setMainTxState({
            txHash: response.hash,
            loading: false,
            success: true,
          });
        } else {
          const txData = supply({
            amount: parseUnits(amountToSupply, decimals).toString(),
            reserve: poolAddress,
          });
          const response = await sendTx(txData);
          setMainTxState({
            txHash: response.hash,
            loading: false,
            success: true,
          });
        }
        refetchWalletBalances();
        refetchPoolData && refetchPoolData();
        refetchIncentiveData && refetchIncentiveData();
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
        });
      }
    };

    return (
      <TxActionsWrapper
        blocked={blocked}
        mainTxState={mainTxState}
        approvalTxState={approvalTxState}
        isWrongNetwork={isWrongNetwork}
        requiresAmount
        amount={amountToSupply}
        symbol={symbol}
        preparingTransactions={loadingTxns}
        actionText={<Trans>Supply {symbol}</Trans>}
        actionInProgressText={<Trans>Supplying {symbol}</Trans>}
        handleApproval={() => approval()}
        handleAction={action}
        requiresApproval={requiresApproval}
        tryPermit={permitAvailable}
        sx={sx}
        {...props}
      />
    );
  }
);
