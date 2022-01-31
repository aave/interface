import { EthereumTransactionTypeExtended, Pool } from '@aave/contract-helpers';
import { BigNumber } from '@ethersproject/bignumber';
import { SignatureLike } from '@ethersproject/bytes';
import { useEffect, useState } from 'react';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

interface UseTransactionHandlerProps {
  handleGetTxns: () => Promise<EthereumTransactionTypeExtended[]>;
  handleGetPermitTxns?: (signature: SignatureLike) => Promise<EthereumTransactionTypeExtended[]>;
  tryPermit?: boolean;
  customGasPrice?: string;
  skip?: boolean;
}

export type TxStateType = {
  txHash: string | null;
  error: string | null;
};

export const useTransactionHandler = ({
  handleGetTxns,
  handleGetPermitTxns,
  tryPermit = false,
  customGasPrice,
  skip,
}: UseTransactionHandlerProps) => {
  const { signTxData, sendTx, currentAccount } = useWeb3Context();
  const { lendingPool } = useTxBuilderContext();
  const [loading, setLoading] = useState(false);
  const [txs, setTxs] = useState<EthereumTransactionTypeExtended[]>([]);
  const [usePermit, setUsePermit] = useState<boolean>(tryPermit);
  const [signature, setSignature] = useState<SignatureLike>();
  const [approved, setApproved] = useState<boolean>();
  const [approvalTxState, setApprovalTxState] = useState<TxStateType>({
    txHash: null,
    error: null,
  });
  const [mainTxState, setMainTxState] = useState<TxStateType>({
    txHash: null,
    error: null,
  });

  const approvalTx = txs.find((tx) => tx.txType === 'ERC20_APPROVAL');
  const actionTx = txs.find((tx) => ['DLP_ACTION'].includes(tx.txType));

  /**
   * Executes the transactions and handles loading & error states.
   * @param fn
   * @returns
   */
  // eslint-disable-next-line
  const processTx = async <T extends any>({
    tx,
    errorCallback,
    successCallback,
  }: {
    tx: () => Promise<T>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errorCallback?: (error: any) => void;
    successCallback?: (param: T) => void;
  }) => {
    setLoading(true);
    try {
      const txnResult = await tx();
      setLoading(false);
      successCallback && successCallback(txnResult);
      return txnResult;
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
          await processTx({
            tx: () => signTxData(unsingedPayload),
            successCallback: (signature: SignatureLike) => {
              setSignature(signature);
              setApproved(true);
              setApprovalTxState({
                txHash: 'Signed correctly',
                error: null,
              });
            },
            errorCallback: (error) => {
              setApprovalTxState({
                txHash: null,
                error: error.message.toString(),
              });
            },
          });
        } catch (error) {
          setApprovalTxState({
            txHash: null,
            error: error.message.toString(),
          });
        }
      } else {
        try {
          const params = await approvalTx.tx();
          if (customGasPrice) params.gasPrice = BigNumber.from(customGasPrice);
          await processTx({
            tx: () => sendTx(params),
            successCallback: (txnResponse) => {
              setApproved(true);
              setApprovalTxState({
                txHash: txnResponse.hash,
                error: null,
              });
            },
            errorCallback: (error) => {
              setApprovalTxState({
                txHash: null,
                error: error.message.toString(),
              });
            },
          });
        } catch (error) {
          setApprovalTxState({
            txHash: null,
            error: error.message.toString(),
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
          successCallback: (txnResponse) => {
            setMainTxState({
              txHash: txnResponse.hash,
              error: null,
            });
          },
          errorCallback: (error) => {
            setMainTxState({
              txHash: null,
              error: error.message.toString(),
            });
          },
        });
      } catch (error) {
        setMainTxState({
          txHash: null,
          error: error.message.toString(),
        });
      }
    }
    if ((!usePermit || !approvalTx) && actionTx) {
      try {
        const params = await actionTx.tx();
        if (customGasPrice) params.gasPrice = BigNumber.from(customGasPrice);
        return processTx({
          tx: () => sendTx(params),
          successCallback: (txnResponse) => {
            setMainTxState({
              txHash: txnResponse.hash,
              error: null,
            });
          },
          errorCallback: (error) => {
            setMainTxState({
              txHash: null,
              error: error.message.toString(),
            });
          },
        });
      } catch (error) {
        setMainTxState({
          txHash: null,
          error: error.message.toString(),
        });
      }
    }
  };

  const resetStates = () => {
    setMainTxState({
      error: null,
      txHash: null,
    });
    setApprovalTxState({
      error: null,
      txHash: null,
    });
    setUsePermit(false);
    setApproved(false);
  };

  // populate txns
  useEffect(() => {
    // good enough for now, but might need debounce or similar for swaps
    if (!skip) {
      setLoading(true);
      handleGetTxns()
        .then((data) => {
          data && setTxs(data);
          setLoading(false);
        })
        .catch((error) => {
          setMainTxState({
            txHash: null,
            error: error.message.toString(),
          });
        });
    }
  }, [skip]);

  return {
    approval,
    action,
    loading,
    setUsePermit,
    approved: approved || !!signature,
    requiresApproval: !!approvalTx,
    approvalTxState,
    mainTxState,
    usePermit,
    resetStates,
  };
};
