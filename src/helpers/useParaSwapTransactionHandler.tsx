import { EthereumTransactionTypeExtended, GasType } from '@aave/contract-helpers';
import { TransactionResponse } from '@ethersproject/providers';
import { DependencyList, useEffect, useRef, useState } from 'react';
import { useBackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';

export const MOCK_SIGNED_HASH = 'Signed correctly';

interface UseParaSwapTransactionHandlerProps {
  handleGetApprovalTx: () => Promise<EthereumTransactionTypeExtended | undefined>;
  handleGetTxns: () => Promise<EthereumTransactionTypeExtended[]>;
  skip?: boolean;
  deps?: DependencyList;
}

export const useParaSwapTransactionHandler = ({
  handleGetApprovalTx,
  handleGetTxns,
  skip,
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
    try {
      setLoadingTxns(true);
      const txs = await handleGetTxns();
      const actionTx = txs.find((tx) =>
        [
          'DLP_ACTION',
          'REWARD_ACTION',
          'FAUCET_MINT',
          'STAKE_ACTION',
          'GOV_DELEGATION_ACTION',
          'GOVERNANCE_ACTION',
        ].includes(tx.txType)
      );
      if (actionTx) {
        console.log(actionTx);
        let gas: GasType | null = null;
        try {
          gas = await txs[txs.length - 1].gas();
          console.log('ESTIMATING GAS');
        } catch (error) {
          const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
          setTxError(parsedError);
        }
        setGasLimit(gas?.gasLimit || '');
        setLoadingTxns(false);

        setMainTxState({ ...mainTxState, loading: false });
      }
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  // populate txns
  useEffect(() => {
    // good enough for now, but might need debounce or similar for swaps
    if (!skip) {
      setLoadingTxns(true);
      const timeout = setTimeout(() => {
        setLoadingTxns(true);
        console.log('ESIMATING GAS??????');
        return handleGetApprovalTx()
          .then(async (data) => {
            if (!mounted.current) return;
            setApprovalTx(data);
            setMainTxState({
              txHash: undefined,
            });
            setTxError(undefined);
            setLoadingTxns(false);
          })
          .catch((error) => {
            if (!mounted.current) return;
            setMainTxState({
              txHash: undefined,
            });
            const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
            setTxError(parsedError);
            setLoadingTxns(false);
          });
      }, 1000);
      return () => clearTimeout(timeout);
    } else {
      setApprovalTx(undefined);
      setActionTx(undefined);
    }
  }, [skip, ...deps]);

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
