import { EthereumTransactionTypeExtended, GasType } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { TransactionResponse } from '@ethersproject/providers';
import { DependencyList, useEffect, useRef, useState } from 'react';
import { useBackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';

export const MOCK_SIGNED_HASH = 'Signed correctly';

interface UseTransactionHandlerProps {
  handleGetTxns: () => Promise<EthereumTransactionTypeExtended[]>;
  handleGetPermitTxns?: (
    signature: SignatureLike,
    deadline: string
  ) => Promise<EthereumTransactionTypeExtended[]>;
  tryPermit?: boolean;
  skip?: boolean;
  deps?: DependencyList;
}

interface ApprovalProps {
  amount?: string;
  underlyingAsset?: string;
  forceApprovalTx?: boolean;
}

export const useTransactionHandler = ({
  handleGetTxns,
  handleGetPermitTxns,
  tryPermit = false,
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
    setTxError,
  } = useModalContext();
  const { signTxData, sendTx, getTxError } = useWeb3Context();
  const { refetchWalletBalances, refetchPoolData, refetchIncentiveData } =
    useBackgroundDataProvider();
  const [signature, setSignature] = useState<SignatureLike>();
  const [signatureDeadline, setSignatureDeadline] = useState<string>();
  const signERC20Approval = useRootStore((state) => state.signERC20Approval);

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

  const approval = async ({ amount, underlyingAsset, forceApprovalTx }: ApprovalProps) => {
    if (approvalTx) {
      if (tryPermit && amount && underlyingAsset && !forceApprovalTx) {
        setApprovalTxState({ ...approvalTxState, loading: true });
        try {
          // deadline is an hour after signature
          const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
          const unsingedPayload = await signERC20Approval({
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
      } else {
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
    }
  };

  const action = async () => {
    if (approvalTx && tryPermit && handleGetPermitTxns) {
      if (!signature || !signatureDeadline) throw new Error('signature needed');
      try {
        setMainTxState({ ...mainTxState, loading: true });
        const txns = await handleGetPermitTxns(signature, signatureDeadline);
        const params = await txns[0].tx();
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
          txHash: undefined,
          loading: false,
        });
      }
    }
    if ((!tryPermit || !approvalTx) && actionTx) {
      try {
        setMainTxState({ ...mainTxState, loading: true });
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
          txHash: undefined,
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
                  'GOVERNANCE_ACTION',
                ].includes(tx.txType)
              )
            );
            setMainTxState({
              txHash: undefined,
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
    usePermit: tryPermit,
    actionTx,
    approvalTx,
  };
};
