import { EthereumTransactionTypeExtended, Pool } from '@aave/contract-helpers';
import { BigNumber } from '@ethersproject/bignumber';
import { SignatureLike } from '@ethersproject/bytes';
import { TransactionResponse } from '@ethersproject/providers';
import { DependencyList, useEffect, useState } from 'react';
import { useBackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

interface UseTransactionHandlerProps {
  handleGetTxns: () => Promise<EthereumTransactionTypeExtended[]>;
  handleGetPermitTxns?: (signature: SignatureLike) => Promise<EthereumTransactionTypeExtended[]>;
  tryPermit?: boolean;
  customGasPrice?: string;
  skip?: boolean;
  deps?: DependencyList;
}

export type TxStateType = {
  txHash?: string;
  txError?: string;
  gasEstimationError?: string;
};

export const useTransactionHandler = ({
  handleGetTxns,
  handleGetPermitTxns,
  tryPermit = false,
  customGasPrice,
  skip,
  deps = [],
}: UseTransactionHandlerProps) => {
  const { signTxData, sendTx, getTxError, currentAccount } = useWeb3Context();
  const { refetchWalletBalances, refetchPoolData } = useBackgroundDataProvider();
  const { lendingPool } = useTxBuilderContext();
  const [loading, setLoading] = useState(false);
  // const [txs, setTxs] = useState<EthereumTransactionTypeExtended[]>([]);
  const [usePermit, setUsePermit] = useState<boolean>(tryPermit);
  const [signature, setSignature] = useState<SignatureLike>();
  const [approved, setApproved] = useState<boolean>(false);
  const [approvalTxState, setApprovalTxState] = useState<TxStateType>({});
  const [mainTxState, setMainTxState] = useState<TxStateType>({});

  const [approvalTx, setApprovalTx] = useState<EthereumTransactionTypeExtended | undefined>();
  const [actionTx, setActionTx] = useState<EthereumTransactionTypeExtended | undefined>();

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
    setLoading(true);
    try {
      const txnResult = await tx();
      try {
        await txnResult.wait(1);
        refetchWalletBalances();
      } catch (e) {
        try {
          setLoading(false);
          const error = await getTxError(txnResult.hash);
          errorCallback && errorCallback(error, txnResult.hash);
          return;
        } catch (e) {
          const error = new Error(
            'network error has occurred, please check tx status in your wallet'
          );
          errorCallback && errorCallback(error, txnResult.hash);
          return;
        }
      }

      // wait for confirmation
      setLoading(false);
      successCallback && successCallback(txnResult);
      return;
    } catch (e) {
      setLoading(false);
      errorCallback && errorCallback(e);
    }
  };

  const approval = async (amount: string, underlyingAsset: string) => {
    if (approvalTx) {
      if (usePermit) {
        try {
          const newPool: Pool = lendingPool as Pool;
          const unsingedPayload = await newPool.signERC20Approval({
            user: currentAccount,
            reserve: underlyingAsset,
            amount,
          });
          try {
            setLoading(true);
            const signature = await signTxData(unsingedPayload);
            setSignature(signature);
            setApproved(true);
            setApprovalTxState({
              txHash: 'Signed correctly',
              txError: undefined,
              gasEstimationError: undefined,
            });

            setLoading(false);
          } catch (error) {
            setApprovalTxState({
              txHash: undefined,
              txError: error.message.toString(),
              gasEstimationError: undefined,
            });
            setLoading(false);
          }
        } catch (error) {
          setApprovalTxState({
            txHash: undefined,
            txError: undefined,
            gasEstimationError: error.message.toString(),
          });
        }
      } else {
        try {
          const params = await approvalTx.tx();
          if (customGasPrice) params.gasPrice = BigNumber.from(customGasPrice);
          await processTx({
            tx: () => sendTx(params),
            successCallback: (txnResponse: TransactionResponse) => {
              setApproved(true);
              setApprovalTxState({
                txHash: txnResponse.hash,
                txError: undefined,
                gasEstimationError: undefined,
              });
            },
            errorCallback: (error, hash) => {
              setApprovalTxState({
                txHash: hash,
                txError: error.message.toString(),
                gasEstimationError: undefined,
              });
            },
          });
        } catch (error) {
          setApprovalTxState({
            txHash: undefined,
            txError: undefined,
            gasEstimationError: error.message.toString(),
          });
        }
      }
    }
  };

  const action = async () => {
    if (approvalTx && usePermit && handleGetPermitTxns) {
      if (!signature) throw new Error('signature needed');
      try {
        const txns = await handleGetPermitTxns(signature);
        const params = await txns[0].tx();
        if (customGasPrice) params.gasPrice = BigNumber.from(customGasPrice);
        return processTx({
          tx: () => sendTx(params),
          successCallback: (txnResponse: TransactionResponse) => {
            setMainTxState({
              txHash: txnResponse.hash,
              txError: undefined,
              gasEstimationError: undefined,
            });
            refetchPoolData && refetchPoolData();
          },
          errorCallback: (error, hash) => {
            setMainTxState({
              txHash: hash,
              txError: error.message.toString(),
              gasEstimationError: undefined,
            });
          },
        });
      } catch (error) {
        setMainTxState({
          txHash: undefined,
          txError: undefined,
          gasEstimationError: error.message.toString(),
        });
      }
    }
    if ((!usePermit || !approvalTx) && actionTx) {
      try {
        const params = await actionTx.tx();
        if (customGasPrice) params.gasPrice = BigNumber.from(customGasPrice);
        return processTx({
          tx: () => sendTx(params),
          successCallback: (txnResponse: TransactionResponse) => {
            setMainTxState({
              txHash: txnResponse.hash,
              txError: undefined,
              gasEstimationError: undefined,
            });
            refetchPoolData && refetchPoolData();
          },
          errorCallback: (error, hash) => {
            setMainTxState({
              txHash: hash,
              txError: error.message.toString(),
              gasEstimationError: undefined,
            });
          },
        });
      } catch (error) {
        setMainTxState({
          txHash: undefined,
          txError: undefined,
          gasEstimationError: error.message.toString(),
        });
      }
    }
  };

  const resetStates = () => {
    setUsePermit(false);
    setMainTxState({});
    setApprovalTxState({});
    setApproved(false);
  };

  // populate txns
  useEffect(() => {
    setLoading(true);
    // good enough for now, but might need debounce or similar for swaps
    if (!skip) {
      // setLoading(true);
      const timeout = setTimeout(
        () =>
          handleGetTxns()
            .then((data) => {
              setApprovalTx(data.find((tx) => tx.txType === 'ERC20_APPROVAL'));
              setActionTx(data.find((tx) => ['DLP_ACTION', 'REWARD_ACTION'].includes(tx.txType)));
              setMainTxState({
                txHash: undefined,
                txError: undefined,
                gasEstimationError: undefined,
              });
              setLoading(false);
            })
            .catch((error) => {
              setMainTxState({
                txHash: undefined,
                txError: undefined,
                gasEstimationError: error.message.toString(),
              });
              setLoading(false);
            }),
        1500
      );
      return () => clearTimeout(timeout);
    } else {
      setApprovalTx(undefined);
      setActionTx(undefined);
      setLoading(false);
    }
  }, [skip, ...deps]);

  return {
    approval,
    action,
    loading,
    setUsePermit,
    approved,
    requiresApproval: !!approvalTx,
    approvalTxState,
    mainTxState,
    usePermit,
    resetStates,
    setApproved,
    actionTx,
    approvalTx,
  };
};
