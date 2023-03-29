import { EthereumTransactionTypeExtended } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { TransactionResponse } from '@ethersproject/providers';
import { queryClient } from 'pages/_app.page';
import { DependencyList, useEffect, useRef, useState } from 'react';
import { useBackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { SIGNATURE_AMOUNT_MARGIN } from 'src/hooks/paraswap/common';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { QueryKeys } from 'src/ui-config/queries';

import { MOCK_SIGNED_HASH } from './useTransactionHandler';

interface UseParaSwapTransactionHandlerProps {
  /**
   * This function is called when the user clicks the action button in the modal and should return the transaction for the swap or repay.
   * The paraswap API should be called in the implementation to get the required transaction parameters.
   */
  handleGetTxns: (
    signature?: SignatureLike,
    deadline?: string
  ) => Promise<EthereumTransactionTypeExtended[]>;
  /**
   * This function is only called once on initial load, and should return a transaction for the swap or repay,
   * but the paraswap API should not be called in the implementation. This is to determine if an approval is needed and
   * to get the gas limit for the swap or repay.
   */
  handleGetApprovalTxns: () => Promise<EthereumTransactionTypeExtended[]>;
  /**
   * The gas limit recommendation to use for the swap or repay. This is used in the case where there is no approval needed.
   */
  gasLimitRecommendation: string;
  /**
   * If true, handleGetApprovalTxns will not be called. Can be used if the route information is still loading.
   */
  skip?: boolean;
  spender: string;
  deps?: DependencyList;
}

interface ApprovalProps {
  amount?: string;
  underlyingAsset?: string;
}

export const useParaSwapTransactionHandler = ({
  handleGetTxns,
  handleGetApprovalTxns,
  gasLimitRecommendation,
  skip,
  spender,
  deps = [],
}: UseParaSwapTransactionHandlerProps) => {
  const {
    approvalTxState,
    setApprovalTxState,
    mainTxState,
    setMainTxState,
    setGasLimit,
    loadingTxns,
    setLoadingTxns,
    setTxError,
  } = useModalContext();
  const { sendTx, getTxError, signTxData } = useWeb3Context();
  const { refetchPoolData, refetchIncentiveData } = useBackgroundDataProvider();
  const { walletApprovalMethodPreference, generateSignatureRequst } = useRootStore();

  const [approvalTx, setApprovalTx] = useState<EthereumTransactionTypeExtended | undefined>();
  const [actionTx, setActionTx] = useState<EthereumTransactionTypeExtended | undefined>();
  const [signature, setSignature] = useState<SignatureLike | undefined>();
  const [signatureDeadline, setSignatureDeadline] = useState<string | undefined>();
  interface Dependency {
    asset: string;
    amount: string;
  }
  const [previousDeps, setPreviousDeps] = useState<Dependency>({ asset: deps[0], amount: deps[1] });
  const [usePermit, setUsePermit] = useState(false);
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
        queryClient.invalidateQueries({ queryKey: [QueryKeys.POOL_TOKENS] });
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

  const approval = async ({ amount, underlyingAsset }: ApprovalProps) => {
    if (usePermit && amount && underlyingAsset) {
      setApprovalTxState({ ...approvalTxState, loading: true });
      try {
        // deadline is an hour after signature
        const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
        const unsingedPayload = await generateSignatureRequst({
          token: underlyingAsset,
          amount: amount,
          deadline,
          spender,
        });
        try {
          const signature = await signTxData(unsingedPayload);
          if (!mounted.current) return;
          setSignature(signature);
          setSignatureDeadline(deadline);
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
      } catch (error) {
        if (!mounted.current) return;
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setApprovalTxState({
          txHash: undefined,
          loading: false,
        });
      }
    } else if (approvalTx) {
      try {
        setApprovalTxState({ ...approvalTxState, loading: true });
        const params = await approvalTx.tx();
        delete params.gasPrice;
        await processTx({
          tx: () => sendTx(params),
          successCallback: (txnResponse: TransactionResponse) => {
            setApprovalTxState({
              txHash: txnResponse.hash,
              loading: false,
              success: true,
            });
            setTxError(undefined);
          },
          errorCallback: (error, hash) => {
            const parsedError = getErrorTextFromError(error, TxAction.APPROVAL, false);
            setTxError(parsedError);
            setApprovalTxState({
              txHash: hash,
              loading: false,
            });
          },
          action: TxAction.APPROVAL,
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
  };

  const action = async () => {
    setMainTxState({ ...mainTxState, loading: true });
    setTxError(undefined);
    await handleGetTxns(signature, signatureDeadline)
      .then(async (data) => {
        // Find actionTx (repay with collateral or swap)
        const actionTx = data.find((tx) => ['DLP_ACTION'].includes(tx.txType));
        if (actionTx) {
          try {
            const params = await actionTx.tx();
            delete params.gasPrice;
            return processTx({
              tx: () => sendTx(params),
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
            setTxError(parsedError);
            setMainTxState({
              ...mainTxState,
              loading: false,
            });
          }
        }
      })
      .catch((error) => {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          ...mainTxState,
          loading: false,
        });
      });
  };

  // Populates the approval transaction and sets the default gas estimation.
  useEffect(() => {
    if (!skip) {
      setLoadingTxns(true);
      handleGetApprovalTxns()
        .then(async (data) => {
          const approval = data.find((tx) => tx.txType === 'ERC20_APPROVAL');
          const preferPermit = walletApprovalMethodPreference === ApprovalMethod.PERMIT;
          // reset error and approval state if new signature request is required
          if (
            deps[0] !== previousDeps.asset ||
            Number(deps[1]) >
              Number(previousDeps.amount) +
                Number(previousDeps.amount) * (SIGNATURE_AMOUNT_MARGIN / 2)
          ) {
            setApprovalTxState({ success: false });
            setTxError(undefined);
          }
          // clear error but use existing signature if amount changes
          if (Number(deps[1]) < Number(previousDeps.amount)) {
            setTxError(undefined);
          }
          setPreviousDeps({ asset: deps[0], amount: deps[1] });
          if (approval && preferPermit) {
            setUsePermit(true);
            setMainTxState({
              txHash: undefined,
            });
            setLoadingTxns(false);
          } else {
            setUsePermit(false);
            setApprovalTx(approval);
          }
        })
        .finally(() => {
          setMainTxState({
            txHash: undefined,
          });
          setGasLimit(gasLimitRecommendation);
          setLoadingTxns(false);
        });
    } else {
      setApprovalTx(undefined);
      setActionTx(undefined);
    }
  }, [skip, ...deps, walletApprovalMethodPreference]);

  return {
    approval,
    action,
    loadingTxns,
    requiresApproval: !!approvalTx || usePermit,
    approvalTxState,
    mainTxState,
    actionTx,
    approvalTx,
  };
};
