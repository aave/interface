import { EthereumTransactionTypeExtended, GasType, Pool } from '@aave/contract-helpers';
import { BigNumber } from '@ethersproject/bignumber';
import { SignatureLike } from '@ethersproject/bytes';
import { TransactionResponse } from '@ethersproject/providers';
import { DependencyList, useEffect, useRef, useState } from 'react';
import { useBackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

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
  const { approvalTxState, setApprovalTxState, mainTxState, setMainTxState, setGasLimit, resetTx } =
    useModalContext();
  const { signTxData, sendTx, getTxError, currentAccount } = useWeb3Context();
  const { refetchWalletBalances, refetchPoolData } = useBackgroundDataProvider();
  const { lendingPool } = useTxBuilderContext();
  const [loadingTxns, setLoadingTxns] = useState(false);
  // const [txs, setTxs] = useState<EthereumTransactionTypeExtended[]>([]);
  const [usePermit, setUsePermit] = useState<boolean>(tryPermit);
  const [signature, setSignature] = useState<SignatureLike>();
  const [signatureDeadline, setSignatureDeadline] = useState<string>();

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
  }) => {
    try {
      const txnResult = await tx();
      try {
        await txnResult.wait();
        refetchWalletBalances();
        refetchPoolData && refetchPoolData();
      } catch (e) {
        try {
          const error = await getTxError(txnResult.hash);
          mounted.current && errorCallback && errorCallback(error, txnResult.hash);
          return;
        } catch (e) {
          const error = new Error(
            'network error has occurred, please check tx status in your wallet'
          );
          mounted.current && errorCallback && errorCallback(error, txnResult.hash);
          return;
        }
      }

      // wait for confirmation
      mounted.current && successCallback && successCallback(txnResult);
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
              txHash: 'Signed correctly',
              txError: undefined,
              gasEstimationError: undefined,
              loading: false,
              success: true,
            });
          } catch (error) {
            if (!mounted.current) return;
            setApprovalTxState({
              txHash: undefined,
              txError: error.message.toString(),
              gasEstimationError: undefined,
              loading: false,
            });
          }
        } catch (error) {
          if (!mounted.current) return;
          setApprovalTxState({
            txHash: undefined,
            txError: undefined,
            gasEstimationError: error.message.toString(),
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
                txError: undefined,
                gasEstimationError: undefined,
                loading: false,
                success: true,
              });
            },
            errorCallback: (error, hash) => {
              setApprovalTxState({
                txHash: hash,
                txError: error.message.toString(),
                gasEstimationError: undefined,
                loading: false,
              });
            },
          });
        } catch (error) {
          if (!mounted.current) return;
          setApprovalTxState({
            txHash: undefined,
            txError: undefined,
            gasEstimationError: error.message.toString(),
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
              txError: undefined,
              gasEstimationError: undefined,
              loading: false,
              success: true,
            });
          },
          errorCallback: (error, hash) => {
            setMainTxState({
              txHash: hash,
              txError: error.message.toString(),
              gasEstimationError: undefined,
              loading: false,
            });
          },
        });
      } catch (error) {
        setMainTxState({
          txHash: undefined,
          txError: undefined,
          gasEstimationError: error.message.toString(),
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
              txError: undefined,
              gasEstimationError: undefined,
              loading: false,
              success: true,
            });
            refetchPoolData && refetchPoolData();
          },
          errorCallback: (error, hash) => {
            setMainTxState({
              txHash: hash,
              txError: error.message.toString(),
              gasEstimationError: undefined,
              loading: false,
            });
          },
        });
      } catch (error) {
        setMainTxState({
          txHash: undefined,
          txError: undefined,
          gasEstimationError: error.message.toString(),
          loading: false,
        });
      }
    }
  };

  const resetStates = () => {
    setUsePermit(false);
    resetTx();
  };

  // populate txns
  useEffect(() => {
    // good enough for now, but might need debounce or similar for swaps
    if (!skip) {
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
              txError: undefined,
              gasEstimationError: undefined,
            });
            setLoadingTxns(false);
            const gas: GasType | null = await data[data.length - 1].gas();
            setGasLimit(gas?.gasLimit || '');
          })
          .catch((error) => {
            if (!mounted.current) return;
            setMainTxState({
              txHash: undefined,
              txError: undefined,
              gasEstimationError: error.message.toString(),
            });
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
    loadingTxns: loadingTxns || !actionTx,
    setUsePermit,
    requiresApproval: !!approvalTx,
    approvalTxState,
    mainTxState,
    usePermit,
    resetStates,
    actionTx,
    approvalTx,
  };
};
