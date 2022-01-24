import { eEthereumTxType, GasResponse, transactionType } from '@aave/contract-helpers';
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { Dispatch, SetStateAction } from 'react';

export enum TxStatusType {
  submitted = 'submitted',
  confirmed = 'confirmed',
  error = 'error',
}

export interface SendEthTransactionCallbacks {
  onExecution?: (txHash: string) => void;
  onConfirmation?: (receipt: TransactionReceipt) => void;
}

export interface EthTxInterface {
  txGetter: () => Promise<transactionType>;
  stateSetter: Dispatch<SetStateAction<EthTransactionData>>;
  customGasPrice: string | null;
  callbacks?: SendEthTransactionCallbacks;
}

export interface EthTransactionData {
  // name: string;
  txType: eEthereumTxType;
  unsignedData?: () => Promise<transactionType>;
  gas: GasResponse;
  loading?: boolean;
  txStatus?: TxStatusType;
  txHash?: string;
  txReceipt?: TransactionReceipt;
  error?: string;
}

export const sendEthTx = async (
  txGetter: () => Promise<transactionType>,
  stateSetter: Dispatch<SetStateAction<EthTransactionData>>,
  customGasPrice: string | null,
  sendTx: (txData: transactionType) => Promise<TransactionResponse>,
  getTxError: (txHash: string) => Promise<string>,
  callbacks?: SendEthTransactionCallbacks
) => {
  stateSetter((state) => ({
    ...state,
    loading: true,
    txStatus: undefined,
    txHash: undefined,
    txReceipt: undefined,
    error: undefined,
  }));

  let extendedTxData: transactionType;
  try {
    extendedTxData = await txGetter();
    if (customGasPrice) extendedTxData.gasPrice = BigNumber.from(customGasPrice);
  } catch (e) {
    console.log('tx building error', e);
    stateSetter((state) => ({
      ...state,
      loading: false,
      error: e.message.toString(),
    }));
    return;
  }

  let txResponse: TransactionResponse;
  try {
    txResponse = await sendTx(extendedTxData);
  } catch (e) {
    console.error('send-ethereum-tx', e);

    stateSetter((state) => ({
      ...state,
      loading: false,
      error: e.message.toString(),
    }));
    return;
  }

  const txHash = txResponse.hash;

  if (!txHash) {
    stateSetter((state) => ({
      ...state,
      loading: false,
    }));
    return;
  }

  stateSetter((state) => ({
    ...state,
    txHash,
    txStatus: TxStatusType.submitted,
  }));

  // if onExecution callback provided - call it
  if (callbacks?.onExecution && txResponse) {
    callbacks.onExecution(txResponse.hash);
  }

  try {
    const txReceipt = await txResponse.wait(1);
    stateSetter((state) => ({
      ...state,
      txReceipt,
      txStatus: TxStatusType.confirmed,
      loading: false,
    }));

    // if onConfirmation callback provided - call it
    if (callbacks?.onConfirmation) {
      callbacks.onConfirmation(txReceipt);
    }
  } catch (e) {
    let error = 'network error has occurred, please check tx status in an explorer';

    try {
      error = await getTxError(txResponse.hash);
    } catch (e) {
      console.log('network error', e);
    }

    stateSetter((state) => ({
      ...state,
      error,
      txStatus: TxStatusType.error,
      loading: false,
    }));
  }
};
