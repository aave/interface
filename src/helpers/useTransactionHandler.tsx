import { EthereumTransactionTypeExtended, GasType, Pool } from '@aave/contract-helpers';
import { BigNumber } from '@ethersproject/bignumber';
import { SignatureLike } from '@ethersproject/bytes';
import { TransactionResponse } from '@ethersproject/providers';
import { DependencyList, useEffect, useRef, useState } from 'react';
import { useBackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';

export const MOCK_SIGNED_HASH = 'Signed correctly';

interface UseTransactionHandlerProps {
  handleGetTxns: () => Promise<EthereumTransactionTypeExtended[]>;
  handleGetPermitTxns?: (
    signature: SignatureLike,
    deadline: string
  ) => Promise<EthereumTransactionTypeExtended[]>;
  tryPermit?: boolean;
  customGasPrice?: string;
  skip?: boolean;
  deps?: DependencyList;
}

export const useTransactionHandler = ({
  handleGetTxns,
  handleGetPermitTxns,
  tryPermit = false,
  customGasPrice,
  skip,
  deps = [],
}: UseTransactionHandlerProps) => {
  const {
    approvalTxState,
    setApprovalTxState,
    mainTxState,
    setMainTxState,
    setGasLimit,
    loadingTxns,
    setLoadingTxns,
    forcedApproval,
    setTxError,
  } = useModalContext();
  const { signTxData, sendTx, getTxError, currentAccount } = useWeb3Context();
  const { refetchWalletBalances, refetchPoolData, refechIncentiveData } =
    useBackgroundDataProvider();
  const { lendingPool } = useTxBuilderContext();
  const [usePermit, setUsePermit] = useState<boolean>(tryPermit);
  const [signature, setSignature] = useState<SignatureLike>();
  const [signatureDeadline, setSignatureDeadline] = useState<string>();

  const [approvalTx, setApprovalTx] = useState<EthereumTransactionTypeExtended | undefined>();
  const [actionTx, setActionTx] = useState<EthereumTransactionTypeExtended | undefined>();
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true; // Will set it to true on mount ...
    if (forcedApproval) setUsePermit(false);
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
  }) => {
    try {
      const txnResult = await tx();
      try {
        mounted.current && successCallback && successCallback(txnResult);
        await txnResult.wait(1);
        refetchWalletBalances();
        refetchPoolData && refetchPoolData();
        refechIncentiveData && refechIncentiveData();
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

  const approval = async (amount?: string, underlyingAsset?: string) => {
    if (approvalTx) {
      if (usePermit && amount && underlyingAsset) {
        setApprovalTxState({ ...approvalTxState, loading: true });
        try {
          const newPool: Pool = lendingPool as Pool;
          // deadline is an hour after signature
          const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
          const unsingedPayload = await newPool.signERC20Approval({
            user: currentAccount,
            reserve: underlyingAsset,
            amount,
            deadline,
          });
          try {
            const signature = await signTxData(unsingedPayload);
            if (!mounted.current) return;
            setSignature(signature);
            setSignatureDeadline(deadline);
            setApprovalTxState({
              txHash: MOCK_SIGNED_HASH,
              // txError: undefined,
              // gasEstimationError: undefined,
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
              // txError: error.message.toString(),
              // gasEstimationError: undefined,
              loading: false,
            });
          }
        } catch (error) {
          if (!mounted.current) return;
          const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
          setTxError(parsedError);
          setApprovalTxState({
            txHash: undefined,
            // txError: undefined,
            // gasEstimationError: error.message.toString(),
            loading: false,
          });
        }
      } else {
        try {
          setApprovalTxState({ ...approvalTxState, loading: true });
          const params = await approvalTx.tx();
          if (customGasPrice) params.gasPrice = BigNumber.from(customGasPrice);
          await processTx({
            tx: () => sendTx(params),
            successCallback: (txnResponse: TransactionResponse) => {
              setApprovalTxState({
                txHash: txnResponse.hash,
                // txError: undefined,
                // gasEstimationError: undefined,
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
                // txError: error.message.toString(),
                // gasEstimationError: undefined,
                loading: false,
              });
            },
          });
        } catch (error) {
          if (!mounted.current) return;
          const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
          setTxError(parsedError);
          setApprovalTxState({
            txHash: undefined,
            // txError: undefined,
            // gasEstimationError: error.message.toString(),
            loading: false,
          });
        }
      }
    }
  };

  const action = async () => {
    if (approvalTx && usePermit && handleGetPermitTxns) {
      if (!signature || !signatureDeadline) throw new Error('signature needed');
      try {
        setMainTxState({ ...mainTxState, loading: true });
        const txns = await handleGetPermitTxns(signature, signatureDeadline);
        const params = await txns[0].tx();
        if (customGasPrice) params.gasPrice = BigNumber.from(customGasPrice);
        return processTx({
          tx: () => sendTx(params),
          successCallback: (txnResponse: TransactionResponse) => {
            setMainTxState({
              txHash: txnResponse.hash,
              // txError: undefined,
              // gasEstimationError: undefined,
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
              // txError: error.message.toString(),
              // gasEstimationError: undefined,
              loading: false,
            });
          },
        });
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          // txError: undefined,
          // gasEstimationError: error.message.toString(),
          loading: false,
        });
      }
    }
    if ((!usePermit || !approvalTx) && actionTx) {
      try {
        setMainTxState({ ...mainTxState, loading: true });
        const params = await actionTx.tx();
        if (customGasPrice) params.gasPrice = BigNumber.from(customGasPrice);
        return processTx({
          tx: () => sendTx(params),
          successCallback: (txnResponse: TransactionResponse) => {
            setMainTxState({
              txHash: txnResponse.hash,
              // txError: undefined,
              // gasEstimationError: undefined,
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
              // txError: error.message.toString(),
              // gasEstimationError: undefined,
              loading: false,
            });
          },
        });
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          // txError: undefined,
          // gasEstimationError: error.message.toString(),
          loading: false,
        });
      }
    }
  };

  // populate txns
  useEffect(() => {
    // good enough for now, but might need debounce or similar for swaps
    if (!skip) {
      setLoadingTxns(true);
      const timeout = setTimeout(() => {
        setLoadingTxns(true);
        return handleGetTxns()
          .then(async (data) => {
            if (!mounted.current) return;
            setApprovalTx(data.find((tx) => tx.txType === 'ERC20_APPROVAL'));
            setActionTx(
              data.find((tx) =>
                [
                  'DLP_ACTION',
                  'REWARD_ACTION',
                  'FAUCET_MINT',
                  'STAKE_ACTION',
                  'GOV_DELEGATION_ACTION',
                ].includes(tx.txType)
              )
            );
            setMainTxState({
              txHash: undefined,
              // txError: undefined,
              // gasEstimationError: undefined,
            });
            setTxError(undefined);
            let gas: GasType | null = null;
            try {
              gas = await data[data.length - 1].gas();
            } catch (error) {
              const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
              setTxError(parsedError);
            }
            setGasLimit(gas?.gasLimit || '');
            setLoadingTxns(false);
          })
          .catch((error) => {
            if (!mounted.current) return;
            setMainTxState({
              txHash: undefined,
              // txError: undefined,
              // gasEstimationError: error.message.toString(),
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
    setUsePermit,
    requiresApproval: !!approvalTx,
    approvalTxState,
    mainTxState,
    usePermit,
    actionTx,
    approvalTx,
  };
};
