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

export enum ErrorType {
  estimation,
  transaction,
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
  const { signTxData, getTxError, sendTx, currentAccount } = useWeb3Context();
  const { lendingPool } = useTxBuilderContext();
  const [error, setError] = useState<ErrorType | null>(null);
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
    setError(null);
    try {
      const txnResult = await tx();
      setLoading(false);
      successCallback && successCallback(txnResult);
      return txnResult;
    } catch (e) {
      setLoading(false);
      setError(ErrorType.transaction);
      errorCallback && errorCallback(e);
    }
  };

  const approval = async (amount: string, underlyingAsset: string) => {
    if (approvalTx) {
      if (usePermit) {
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
        });
      } else {
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
        });
      }
    }
  };

  const action = async () => {
    if (approvalTx && usePermit && handleGetPermitTxns) {
      if (!signature) throw new Error('signature needed');
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
      });
    }
    if ((!usePermit || !approvalTx) && actionTx) {
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
      });
    }
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
        .catch((e) => {
          setError(ErrorType.estimation);
        });
    }
  }, [skip]);

  return {
    approval,
    action,
    loading,
    error,
    setUsePermit,
    approved: approved || !!signature,
    requiresApproval: !!approvalTx,
    approvalTxState,
    mainTxState,
    usePermit,
  };
};
