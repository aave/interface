import { ApproveType, gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
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
import { APPROVAL_GAS_LIMIT, checkRequiresApproval } from '../utils';

export interface SupplyActionProps extends BoxProps {
  amountToSupply: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  poolAddress: string;
  symbol: string;
  blocked: boolean;
  decimals: number;
}

interface SignedParams {
  signature: SignatureLike;
  deadline: string;
  amount: string;
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
    const [
      tryPermit,
      supply,
      supplyWithPermit,
      getApprovedAmount,
      generateSignatureRequest,
      generateApproval,
      walletApprovalMethodPreference,
      estimateGasLimit,
    ] = useRootStore((state) => [
      state.tryPermit,
      state.supply,
      state.supplyWithPermit,
      state.getApprovedAmount,
      state.generateSignatureRequest,
      state.generateApproval,
      state.walletApprovalMethodPreference,
      state.estimateGasLimit,
    ]);
    const {
      approvalTxState,
      mainTxState,
      loadingTxns,
      setLoadingTxns,
      setApprovalTxState,
      setMainTxState,
      setGasLimit,
      setTxError,
    } = useModalContext();
    const { refetchWalletBalances, refetchPoolData, refetchIncentiveData, refetchGhoData } =
      useBackgroundDataProvider();
    const permitAvailable = tryPermit(poolAddress);
    const { signTxData, sendTx } = useWeb3Context();

    const [usePermit, setUsePermit] = useState(false);
    const [approvedAmount, setApprovedAmount] = useState<ApproveType | undefined>();
    const [requiresApproval, setRequiresApproval] = useState<boolean>(false);
    const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();

    // callback to fetch approved amount and determine execution path on dependency updates
    const fetchApprovedAmount = useCallback(
      async (forceApprovalCheck?: boolean) => {
        // Check approved amount on-chain on first load or if an action triggers a re-check such as an approval being confirmed
        if (!approvedAmount || forceApprovalCheck) {
          setLoadingTxns(true);
          const approvedAmount = await getApprovedAmount({ token: poolAddress });
          setApprovedAmount(approvedAmount);
        }

        if (approvedAmount) {
          const fetchedRequiresApproval = checkRequiresApproval({
            approvedAmount: approvedAmount.amount,
            amount: amountToSupply,
            signedAmount: signatureParams ? signatureParams.amount : '0',
          });
          setRequiresApproval(fetchedRequiresApproval);
          if (fetchedRequiresApproval) setApprovalTxState({});
        }

        setLoadingTxns(false);
      },
      [
        approvedAmount,
        setLoadingTxns,
        getApprovedAmount,
        poolAddress,
        amountToSupply,
        signatureParams,
        setApprovalTxState,
      ]
    );

    // Run on first load to decide execution path
    useEffect(() => {
      fetchApprovedAmount();
    }, [fetchApprovedAmount]);

    // Update gas estimation
    useEffect(() => {
      let supplyGasLimit = 0;
      if (usePermit) {
        supplyGasLimit = Number(
          gasLimitRecommendations[ProtocolAction.supplyWithPermit].recommended
        );
      } else {
        supplyGasLimit = Number(gasLimitRecommendations[ProtocolAction.supply].recommended);
        if (requiresApproval && !approvalTxState.success) {
          supplyGasLimit += Number(APPROVAL_GAS_LIMIT);
        }
      }
      setGasLimit(supplyGasLimit.toString());
    }, [requiresApproval, approvalTxState, usePermit, setGasLimit]);

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
            setSignatureParams({ signature: response, deadline, amount: amountToSupply });
            setApprovalTxState({
              txHash: MOCK_SIGNED_HASH,
              loading: false,
              success: true,
            });
          } else {
            let approveTxData = generateApproval(approvedAmount);
            setApprovalTxState({ ...approvalTxState, loading: true });
            approveTxData = await estimateGasLimit(approveTxData);
            const response = await sendTx(approveTxData);
            await response.wait(1);
            setApprovalTxState({
              txHash: response.hash,
              loading: false,
              success: true,
            });
            fetchApprovedAmount(true);
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
        // determine if approval is signature or transaction
        // checking user preference is not sufficient because permit may be available but the user has an existing approval
        if (usePermit && signatureParams) {
          let signedSupplyWithPermitTxData = supplyWithPermit({
            signature: signatureParams.signature,
            amount: parseUnits(amountToSupply, decimals).toString(),
            reserve: poolAddress,
            deadline: signatureParams.deadline,
          });
          signedSupplyWithPermitTxData = await estimateGasLimit(signedSupplyWithPermitTxData);
          const response = await sendTx(signedSupplyWithPermitTxData);
          await response.wait(1);
          setMainTxState({
            txHash: response.hash,
            loading: false,
            success: true,
          });
        } else {
          let supplyTxData = supply({
            amount: parseUnits(amountToSupply, decimals).toString(),
            reserve: poolAddress,
          });
          supplyTxData = await estimateGasLimit(supplyTxData);
          const response = await sendTx(supplyTxData);
          await response.wait(1);
          setMainTxState({
            txHash: response.hash,
            loading: false,
            success: true,
          });
        }
        refetchWalletBalances();
        refetchPoolData && refetchPoolData();
        refetchIncentiveData && refetchIncentiveData();
        refetchGhoData && refetchGhoData();
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
