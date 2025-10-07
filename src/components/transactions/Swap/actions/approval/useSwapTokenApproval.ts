import { ERC20Service } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { ethers } from 'ethers';
import { defaultAbiCoder, splitSignature } from 'ethers/lib/utils';
import { Dispatch, useEffect, useMemo, useRef, useState } from 'react';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { calculateSignedAmount } from 'src/hooks/paraswap/common';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { permitByChainAndToken } from 'src/ui-config/permitConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { needsUSDTApprovalReset } from 'src/utils/usdtHelpers';
import { useShallow } from 'zustand/shallow';

import { isNativeToken } from '../../helpers/cow';
import { SwapState } from '../../types';

export type SwapTokenApprovalParams = {
  chainId: number;
  token: string;
  decimals: number;
  symbol: string;
  amount: string;
  spender?: string;
  setState: Dispatch<Partial<SwapState>>;
  allowPermit?: boolean;
  margin?: number;
  type?: 'approval' | 'delegation';
};

export interface SignedParams {
  signature: string;
  splitedSignature: {
    v: number;
    r: string;
    s: string;
  };
  deadline: string;
  amount: string;
  approvedToken: string;
}

export const useSwapTokenApproval = ({
  chainId,
  token,
  symbol,
  amount,
  decimals,
  spender,
  setState,
  allowPermit = true,
  margin = 0,
  type = 'approval',
}: SwapTokenApprovalParams) => {
  const [approvedAmount, setApprovedAmount] = useState<string | undefined>();
  const [requiresApprovalReset, setRequiresApprovalReset] = useState(false);
  const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();
  const lastFetchedSpenderRef = useRef<string | undefined>();

  const { approvalTxState, setLoadingTxns, setTxError, setApprovalTxState } = useModalContext();
  const { sendTx, signTxData } = useWeb3Context();

  const [
    getCreditDelegationApprovedAmount,
    generateApproveDelegation,
    generateCreditDelegationSignatureRequest,
  ] = useRootStore(
    useShallow((state) => [
      state.getCreditDelegationApprovedAmount,
      state.generateApproveDelegation,
      state.generateCreditDelegationSignatureRequest,
      state.currentMarketData,
    ])
  );

  const [
    user,
    generateApproval,
    estimateGasLimit,
    walletApprovalMethodPreference,
    generateSignatureRequest,
  ] = useRootStore(
    useShallow((state) => [
      state.account,
      state.generateApproval,
      state.estimateGasLimit,
      state.walletApprovalMethodPreference,
      state.generateSignatureRequest,
    ])
  );

  const requiresApproval = useMemo(() => {
    if (isNativeToken(token)) {
      return false;
    }

    if (approvedAmount === undefined) {
      return true;
    }

    if (approvedAmount === '-1' || amount === '0') {
      return false;
    } else {
      return valueToBigNumber(approvedAmount).isLessThan(valueToBigNumber(amount));
    }
  }, [approvedAmount, amount]);

  // Warning for USDT on Ethereum approval reset
  useEffect(() => {
    const amountToApprove = calculateSignedAmount(amount, decimals, margin);
    const currentApproved = calculateSignedAmount(approvedAmount?.toString() || '0', decimals, 0);

    let needsApprovalReset = false;
    if (needsUSDTApprovalReset(symbol, chainId, currentApproved, amountToApprove)) {
      needsApprovalReset = true;
      setRequiresApprovalReset(true);
    } else {
      needsApprovalReset = false;
    }

    setRequiresApprovalReset(false);
    setState({ requiresApprovalReset: needsApprovalReset });
  }, [symbol, chainId, approvedAmount, amount, decimals]);

  const fetchApprovedAmountFromContract = async () => {
    if (!spender || signatureParams) {
      return;
    }
    setApprovalTxState({
      txHash: undefined,
      loading: false,
      success: false,
    });
    setLoadingTxns(true);
    console.log('setLoadingTxns true');
    const rpc = getProvider(chainId);
    let approvedTargetAmount: string;
    if (type === 'delegation') {
      const creditDelegationApprovedAmount = await getCreditDelegationApprovedAmount({
        debtTokenAddress: token,
        delegatee: spender ?? '',
      });
      approvedTargetAmount = creditDelegationApprovedAmount.amount;
    } else {
      const erc20Service = new ERC20Service(rpc);
      const erc20ApprovedAmount = await erc20Service.approvedAmount({
        user,
        token,
        spender,
      });
      approvedTargetAmount = erc20ApprovedAmount.toString();
    }
    setApprovedAmount(approvedTargetAmount.toString());
    console.log('setLoadingTxns false');
    setLoadingTxns(false);
    setState({
      actionsLoading: false,
    });
  };

  useEffect(() => {
    if (!spender) return;
    if (signatureParams) return; // skip after permit path
    if (approvalTxState.loading || approvalTxState.success) return;
    if (lastFetchedSpenderRef.current === spender) return; // prevent duplicate fetches for same spender (e.g., StrictMode re-mount)

    lastFetchedSpenderRef.current = spender;
    fetchApprovedAmountFromContract();
  }, [spender, signatureParams, approvalTxState.loading, approvalTxState.success]);

  const permitAvailable = permitByChainAndToken[chainId]?.[token];
  const tryPermit = allowPermit && permitAvailable;
  const usePermit = tryPermit && walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  const approval = async () => {
    if (!spender) {
      return;
    }

    const amountToApprove = calculateSignedAmount(amount, 0, margin);

    // If requires approval reset, reset the approval first
    if (requiresApprovalReset) {
      try {
        // Create direct ERC20 approval transaction for reset to 0 as ERC20Service requires positive amount
        const abi = new ethers.utils.Interface([
          'function approve(address spender, uint256 amount)',
        ]);
        const encodedData = abi.encodeFunctionData('approve', [spender, '0']);
        const resetTx = {
          data: encodedData,
          to: token,
          from: spender,
        };
        const resetTxWithGasEstimation = await estimateGasLimit(resetTx, chainId);
        setApprovalTxState({ ...approvalTxState, loading: true });
        const resetResponse = await sendTx(resetTxWithGasEstimation);
        await resetResponse.wait(1);
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.APPROVAL, false);
        setTxError(parsedError);
        setApprovalTxState({
          txHash: undefined,
          loading: false,
        });
        setState({
          actionsLoading: false,
        });
      }
      fetchApprovedAmountFromContract().then(() => {
        setApprovalTxState({
          loading: false,
          success: false,
        });
        setState({
          actionsLoading: false,
        });
      });

      return; // Button will be updated to approve
    }

    const approvalData = {
      spender,
      user,
      token,
      amount: amountToApprove,
    };

    if (usePermit) {
      // Permit approval
      try {
        const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
        let signatureRequest: string;
        if (type === 'delegation') {
          signatureRequest = await generateCreditDelegationSignatureRequest({
            underlyingAsset: token,
            deadline,
            amount: amountToApprove.toString(),
            spender,
          });
        } else {
          signatureRequest = await generateSignatureRequest(
            {
              ...approvalData,
              deadline,
            },
            { chainId: chainId }
          );
        }
        setApprovalTxState({ ...approvalTxState, loading: true });
        const response = await signTxData(signatureRequest);
        const splitedSignature = splitSignature(response);
        const encodedSignature = defaultAbiCoder.encode(
          ['address', 'address', 'uint256', 'uint256', 'uint8', 'bytes32', 'bytes32'],
          [
            approvalData.user,
            approvalData.spender,
            approvalData.amount,
            deadline,
            splitedSignature.v,
            splitedSignature.r,
            splitedSignature.s,
          ]
        );
        setSignatureParams({
          signature: encodedSignature,
          splitedSignature,
          deadline,
          amount: approvalData.amount,
          approvedToken: approvalData.spender,
        });
        setApprovalTxState({
          txHash: MOCK_SIGNED_HASH,
          loading: false,
          success: true,
        });
        setState({
          actionsLoading: false,
        });
        setApprovedAmount(amountToApprove.toString());
        setTxError(undefined);
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.APPROVAL, false);
        setTxError(parsedError);
        setApprovalTxState({
          txHash: undefined,
          loading: false,
        });
        setState({
          actionsLoading: false,
        });
      }
    } else {
      // Direct ERC20 approval transaction
      try {
        let tx;
        if (type === 'delegation') {
          tx = generateApproveDelegation({
            debtTokenAddress: token,
            delegatee: spender ?? '',
            amount: amountToApprove.toString(),
          });
        } else {
          tx = generateApproval(approvalData, {
            chainId: chainId,
            amount: amountToApprove,
          });
        }
        const txWithGasEstimation = await estimateGasLimit(tx, chainId);
        setApprovalTxState({ loading: true });
        const response = await sendTx(txWithGasEstimation);
        await response.wait(1);
        fetchApprovedAmountFromContract().then(() => {
          setApprovalTxState({
            txHash: response.hash,
            loading: false,
            success: true,
          });
          setTxError(undefined);
          setState({
            actionsLoading: false,
          });
        });
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.APPROVAL, false);
        setTxError(parsedError);
        setApprovalTxState({
          txHash: undefined,
          loading: false,
        });
        setState({
          actionsLoading: false,
        });
      }
    }
  };

  const [wasApprovalLoading, setWasApprovalLoading] = useState(false);
  useEffect(() => {
    if (approvalTxState.loading) {
      console.log('approvalTxState.loading', approvalTxState.loading);
      setState({ actionsLoading: true });
      if (!wasApprovalLoading) {
        setWasApprovalLoading(true);
      }
    } else {
      if (wasApprovalLoading) {
        setWasApprovalLoading(false);
        setState({ actionsLoading: false });
      }
    }
  }, [approvalTxState.loading, setState]);

  console.log({
    requiresApproval,
    requiresApprovalReset,
    signatureParams,
    approval,
    tryPermit,
    approvedAmount,
  });

  return {
    requiresApproval,
    requiresApprovalReset,
    signatureParams,
    approval,
    tryPermit,
  };
};
