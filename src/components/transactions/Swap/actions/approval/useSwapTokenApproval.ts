import { ERC20Service } from '@aave/contract-helpers';
import { normalizeBN, valueToBigNumber } from '@aave/math-utils';
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

export type SignatureLike = {
  r: string;
  s: string;
  _vs: string;
  recoveryParam: number;
  v: number;
};
export interface SignedParams {
  signature: string;
  splitedSignature: SignatureLike;
  deadline: string;
  amount: string;
  approvedToken: string;
}

/**
 * Custom React hook to handle token approval flow for swaps.
 *
 * Handles both “traditional” ERC-20 approvals and permit signatures, depending on token and chain support.
 * - Determines if approval or approval reset is required for a given token, amount, and spender.
 * - Exposes functions and state for triggering approvals, permits, and tracking their status.
 * - Integrates with the modal and global stores for transaction state management.
 * - Handles token-specific quirks (e.g., USDT approval reset) and margin calculations for edge cases.
 *
 * @param {object} params - Hook parameters.
 * @param {number} params.chainId - Current chain ID.
 * @param {string} params.token - Address of the token to approve.
 * @param {string} params.symbol - Symbol of the token.
 * @param {string} params.amount - Amount, as string formatter like '1.234567890', for which approval is requested.
 * @param {number} params.decimals - Token decimals.
 * @param {string} [params.spender] - Spender address, smart contract requiring approval.
 * @param {Dispatch<Partial<SwapState>>} params.setState - State setter for updating SwapState.
 * @param {boolean} [params.allowPermit=true] - Whether to allow permit signature flow if supported.
 * @param {number} [params.margin=0] - Optional margin for approval checks (in token units).
 * @param {"approval"|"delegation"} [params.type="approval"] - Approval type; "approval" for typical ERC-20, "delegation" for credit delegation.
 *
 * @returns {{
 *   requiresApproval: boolean;        // Whether an approval transaction is needed.
 *   requiresApprovalReset: boolean;   // Whether an approval "reset" to 0 is needed before the actual approval (e.g. for USDT).
 *   approval: () => Promise<void>;    // Function to trigger the approval transaction.
 *   tryPermit: () => Promise<void>;   // Function to attempt permit signature flow, if available.
 *   signatureParams?: SignedParams;   // Details/signature object if permit is ready.
 * }}
 */
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
  // Keep track of last fetched approval key (token:spender) to avoid duplicate calls for same pair
  const lastFetchedApprovalKeyRef = useRef<string | undefined>();

  const { approvalTxState, setLoadingTxns, setTxError, setApprovalTxState } = useModalContext();
  const { sendTx, signTxData } = useWeb3Context();

  const [
    user,
    generateApproval,
    estimateGasLimit,
    walletApprovalMethodPreference,
    generateSignatureRequest,
    getCreditDelegationApprovedAmount,
    generateApproveDelegation,
    generateCreditDelegationSignatureRequest,
  ] = useRootStore(
    useShallow((state) => [
      state.account,
      state.generateApproval,
      state.estimateGasLimit,
      state.walletApprovalMethodPreference,
      state.generateSignatureRequest,
      state.getCreditDelegationApprovedAmount,
      state.generateApproveDelegation,
      state.generateCreditDelegationSignatureRequest,
      state.currentMarketData,
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
    }

    return valueToBigNumber(approvedAmount).isLessThan(valueToBigNumber(amount));
  }, [approvedAmount, amount, signatureParams, decimals]);

  // Clear status if amount changes
  useEffect(() => {
    if (signatureParams || approvalTxState.success) {
      setSignatureParams(undefined);
      setApprovedAmount(undefined);
      setApprovalTxState({
        txHash: undefined,
        loading: false,
        success: false,
      });
    }
  }, [amount]);

  // Reset approval-related state when token/spender context changes to ensure fresh checks
  useEffect(() => {
    setSignatureParams(undefined);
    setApprovedAmount(undefined);
    lastFetchedApprovalKeyRef.current = undefined;
    setApprovalTxState({ txHash: undefined, loading: false, success: false });
  }, [token, spender, chainId, type]);

  // Warning for USDT on Ethereum approval reset
  useEffect(() => {
    const amountToApprove = calculateSignedAmount(normalizeBN(amount, -decimals).toString(), 0);
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
  }, [symbol, chainId, approvedAmount, amount]);

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

    setLoadingTxns(false);
    setState({
      actionsLoading: false,
    });
  };

  useEffect(() => {
    if (!spender) return;
    if (signatureParams) return; // skip after permit path
    if (approvalTxState.loading || approvalTxState.success) return;

    const approvalKey = `${token.toLowerCase()}:${spender.toLowerCase()}`;
    if (lastFetchedApprovalKeyRef.current === approvalKey) return; // prevent duplicate fetches for same token/spender

    lastFetchedApprovalKeyRef.current = approvalKey;
    fetchApprovedAmountFromContract();
  }, [token, spender, signatureParams, approvalTxState.loading, approvalTxState.success]);

  const permitAvailable = permitByChainAndToken[chainId]?.[token.toLowerCase()];
  const tryPermit = allowPermit && permitAvailable;
  const usePermit = tryPermit && walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  const approval = async () => {
    if (!spender) {
      return;
    }

    const amountToApprove = calculateSignedAmount(
      normalizeBN(amount, -decimals).toString(),
      0,
      margin
    );

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
        const encodedSignature =
          type === 'delegation'
            ? response.toString()
            : defaultAbiCoder.encode(
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
        const newSignatureParams = {
          signature: encodedSignature,
          splitedSignature,
          deadline,
          amount: approvalData.amount,
          approvedToken: approvalData.spender,
        };
        setSignatureParams(newSignatureParams);
        setState({
          actionsLoading: false,
        });

        setApprovedAmount(amountToApprove.toString());
        setTxError(undefined);
        setApprovalTxState({
          txHash: MOCK_SIGNED_HASH,
          loading: false,
          success: true,
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

    // Stop loading quotes
    setState({
      quoteRefreshPaused: true,
      quoteTimerPausedAt: Date.now(),
    });
  };

  return {
    requiresApproval,
    requiresApprovalReset,
    signatureParams,
    approval,
    tryPermit,
    approvedAmount,
  };
};
