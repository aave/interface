import { ActionBundle, ApproveType, SignedApproveType } from '@aave/contract-helpers';
import {
  LPSignedSupplyParamsType,
  LPSupplyParamsType,
} from '@aave/contract-helpers/dist/esm/v3-pool-contract/lendingPoolTypes';
import { SignatureLike } from '@ethersproject/bytes';
import { TransactionResponse } from '@ethersproject/providers';
import { PopulatedTransaction } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { DependencyList, useEffect, useRef, useState } from 'react';
import { useBackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';

export const MOCK_SIGNED_HASH = 'Signed correctly';

// TODO: Generalize these types
interface UseTransactionBundleHandlerProps {
  approvals: Omit<ApproveType, 'user'>;
  generateApprovalTxData: ({ user, token, spender, amount }: ApproveType) => PopulatedTransaction;
  generateApprovalSignatureData: ({
    user,
    token,
    spender,
    amount,
    deadline,
  }: SignedApproveType) => Promise<string>;
  generateTxData: ({
    user,
    reserve,
    amount,
    onBehalfOf,
    referralCode,
    useOptimizedPath,
    encodedTxData,
  }: LPSupplyParamsType) => PopulatedTransaction;
  generateSignedTxData: ({
    user,
    reserve,
    amount,
    onBehalfOf,
    referralCode,
    useOptimizedPath,
    signature,
    encodedTxData,
  }: LPSignedSupplyParamsType) => PopulatedTransaction;
  tryPermit?: boolean;
  nullState?: boolean;
  deps?: DependencyList;
}

export const useTransactionBundleHandler = ({
  approvals,
  generateApprovalSignatureData,
  generateApprovalTxData,
  generateSignedTxData,
  generateTxData,
  tryPermit,
  nullState,
  deps = [],
}: UseTransactionBundleHandlerProps) => {
  const {
    approvalTxState,
    setApprovalTxState,
    mainTxState,
    setMainTxState,
    setGasLimit,
    setLoadingTxns,
    setTxError,
    loadingTxns,
  } = useModalContext();
  const { signTxData, sendTx, getTxError } = useWeb3Context();
  const { refetchWalletBalances, refetchPoolData, refetchIncentiveData } =
    useBackgroundDataProvider();
  const [signatures, setSignatures] = useState<SignatureLike[]>([]);
  const [walletApprovalMethodPreference, approvedAmount] = useRootStore((state) => [
    state.walletApprovalMethodPreference,
    state.approvedAmount,
  ]);
  const [bundle, setBundle] = useState<ActionBundle>();
  const [usePermit, setUsePermit] = useState(false);
  interface TokenApproval {
    token: string;
    approvedAmount: number;
  }
  const [approvedAmounts, setApprovedAmounts] = useState<TokenApproval[]>([]);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true; // Will set it to true on mount ...
    return () => {
      mounted.current = false;
    }; // ... and to false on unmount
  }, []);
  /**
   * Executes the transactions and handles loading & error states.
   * @param fn
   * @returns
   */
  // eslint-disable-next-line
  const processTx = async ({
    tx,
    errorCallback,
    successCallback,
  }: {
    tx: () => Promise<TransactionResponse>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errorCallback?: (error: any, hash?: string) => void;
    successCallback?: (param: TransactionResponse) => void;
    action: TxAction;
  }) => {
    try {
      const txnResult = await tx();
      try {
        await txnResult.wait(1);
        mounted.current && successCallback && successCallback(txnResult);

        refetchWalletBalances();
        refetchPoolData && refetchPoolData();
        refetchIncentiveData && refetchIncentiveData();
      } catch (e) {
        // TODO: what to do with this error?
        try {
          // TODO: what to do with this error?
          const error = await getTxError(txnResult.hash);
          mounted.current && errorCallback && errorCallback(new Error(error), txnResult.hash);
          return;
        } catch (e) {
          mounted.current && errorCallback && errorCallback(e, txnResult.hash);
          return;
        }
      }

      return;
    } catch (e) {
      errorCallback && errorCallback(e);
    }
  };

  const approval = async () => {
    if (bundle && bundle?.approvals.length > 0) {
      if (usePermit && bundle.signatureRequests.length > 0) {
        setApprovalTxState({ ...approvalTxState, loading: true });
        try {
          const signatures: SignatureLike[] = [];
          for (const unsignedPayload of bundle.signatureRequests) {
            signatures.push(await signTxData(unsignedPayload));
          }
          if (!mounted.current) return;
          setSignatures(signatures);
          setApprovalTxState({
            txHash: MOCK_SIGNED_HASH,
            loading: false,
            success: true,
          });
          setTxError(undefined);
        } catch (error) {
          if (!mounted.current) return;
          const parsedError = getErrorTextFromError(error, TxAction.APPROVAL, false);
          setTxError(parsedError);

          setApprovalTxState({
            txHash: undefined,
            loading: false,
          });
        }
      } else {
        try {
          setApprovalTxState({ ...approvalTxState, loading: true });
          const approvalResponses = await Promise.all(
            bundle.approvals.map(
              (approval) =>
                new Promise<TransactionResponse>(async (resolve, reject) => {
                  processTx({
                    tx: () => sendTx(approval),
                    successCallback: (txnResponse: TransactionResponse) => {
                      resolve(txnResponse);
                    },
                    errorCallback: (error, hash) => {
                      const parsedError = getErrorTextFromError(error, TxAction.APPROVAL, false);
                      setTxError(parsedError);
                      setApprovalTxState({
                        txHash: hash,
                        loading: false,
                      });
                      reject();
                    },
                    action: TxAction.APPROVAL,
                  });
                })
            )
          );
          setApprovalTxState({
            txHash: approvalResponses[0].hash,
            loading: false,
            success: true,
          });
        } catch (error) {
          if (!mounted.current) return;
          const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
          setTxError(parsedError);
          setApprovalTxState({
            txHash: undefined,
            loading: false,
          });
        }
      }
    }
  };

  const action = async () => {
    if (bundle) {
      // Using signed action
      if (usePermit && bundle?.signatureRequests.length > 0) {
        if (!signatures.length) throw new Error('signature needed');
        try {
          setMainTxState({ ...mainTxState, loading: true });
          const signatureStrings = signatures.map((signature: SignatureLike) =>
            signature.toString()
          );
          // Generate signed action using signatures and callback function from bundle
          const txn = await bundle.generateSignedAction({ signatures: signatureStrings });
          return processTx({
            tx: () => sendTx(txn),
            successCallback: (txnResponse: TransactionResponse) => {
              setMainTxState({
                txHash: txnResponse.hash,
                loading: false,
                success: true,
              });
              setTxError(undefined);
            },
            errorCallback: (error, hash) => {
              const parsedError = getErrorTextFromError(error, TxAction.MAIN_ACTION);
              setTxError(parsedError);
              setMainTxState({
                txHash: hash,
                loading: false,
              });
            },
            action: TxAction.MAIN_ACTION,
          });
        } catch (error) {
          console.log(error, 'error');
          const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
          setTxError(parsedError);
          setMainTxState({
            txHash: undefined,
            loading: false,
          });
        }
      } else {
        // Not using signed action
        try {
          setMainTxState({ ...mainTxState, loading: true });
          return processTx({
            tx: () => sendTx(bundle.action),
            successCallback: (txnResponse: TransactionResponse) => {
              setMainTxState({
                txHash: txnResponse.hash,
                loading: false,
                success: true,
              });
              setTxError(undefined);
            },
            errorCallback: (error, hash) => {
              const parsedError = getErrorTextFromError(error, TxAction.MAIN_ACTION);
              setTxError(parsedError);
              setMainTxState({
                txHash: hash,
                loading: false,
              });
            },
            action: TxAction.MAIN_ACTION,
          });
        } catch (error) {
          const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
          console.log(error, parsedError);
          setTxError(parsedError);
          setMainTxState({
            txHash: undefined,
            loading: false,
          });
        }
      }
    } else {
      throw new Error('Transaction bundle not defined');
    }
  };

  useEffect(() => {
    handleGetBundle({}).then(async (fetchedBundle) => {
      setBundle(fetchedBundle);
      const approvalTransactions = fetchedBundle.approvals;
      const preferPermit =
        fetchedBundle.signatureRequests.length > 0 &&
        tryPermit &&
        walletApprovalMethodPreference === ApprovalMethod.PERMIT;
      if (approvalTransactions.length > 0 && preferPermit) {
        // For permit flow, jsut use recommendation for gas limit as estimation will always fail without signature and tx must be rebuilt with signature anyways
        setUsePermit(true);
        const gas = fetchedBundle.signedActionGasEstimate;
        setGasLimit(gas);
      } else {
        setUsePermit(false);
      }
      setMainTxState({
        txHash: undefined,
      });
    });
  }, []);

  // populate txns
  // fetches standard txs (optional aproval + action), then based off availability and user preference, set tx flow and gas estimation to permit or approve
  useEffect(() => {
    if (!approvalAmount) {
    }
  }, [...deps, tryPermit, walletApprovalMethodPreference]);

  return {
    approval,
    action,
    loadingTxns,
    setUsePermit,
    requiresApproval: !!bundle && bundle.approvals.length > 0,
    approvalTxState,
    mainTxState,
    usePermit,
  };
};
