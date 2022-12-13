import { EthereumTransactionTypeExtended } from '@aave/contract-helpers';
import { TransactionResponse } from '@ethersproject/providers';
import { useEffect, useRef, useState } from 'react';
import { useBackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';

interface UseParaSwapTransactionHandlerProps {
  /**
   * This function is called when the user clicks the action button in the modal and should return the transaction for the swap or repay.
   * The paraswap API should be called in the implementation to get the required transaction parameters.
   */
  handleGetTxns: () => Promise<EthereumTransactionTypeExtended[]>;
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
}

export const useParaSwapTransactionHandler = ({
  handleGetTxns,
  handleGetApprovalTxns,
  gasLimitRecommendation,
  skip,
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
  const { sendTx, getTxError } = useWeb3Context();
  const { refetchWalletBalances, refetchPoolData, refetchIncentiveData } =
    useBackgroundDataProvider();

  const [approvalTx, setApprovalTx] = useState<EthereumTransactionTypeExtended | undefined>();
  const [actionTx, setActionTx] = useState<EthereumTransactionTypeExtended | undefined>();
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
    if (approvalTx) {
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
    await handleGetTxns()
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
          setApprovalTx(data.find((tx) => tx.txType === 'ERC20_APPROVAL'));
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
  }, [skip]);

  return {
    approval,
    action,
    loadingTxns,
    requiresApproval: !!approvalTx,
    approvalTxState,
    mainTxState,
    actionTx,
    approvalTx,
  };
};
