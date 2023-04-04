import { ProtocolAction } from '@aave/contract-helpers';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

export type Transactions = {
  [chainId: number]: {
    [hash: string]: TransactionDetails;
  };
};

export type TransactionDetails = {
  action: ProtocolAction;
  txState: TransactionState;
  // TODO: more info?
  asset?: string;
  amount?: string;
  assetName?: string;
  market?: string;
};

type TransactionState = 'loading' | 'success' | 'failed';

export interface TransactionsSlice {
  transactions: Transactions;
  addTransaction: (chainId: number, txHash: string, transaction: TransactionDetails) => void;
  updateTransaction: (
    chainId: number,
    txHash: string,
    transaction: Partial<TransactionDetails>
  ) => void;
}

export const createTransactionsSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  TransactionsSlice
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
> = (set, _get) => {
  return {
    transactions: [],
    addTransaction: (chainId: number, txHash: string, transaction: TransactionDetails) => {
      set((state) => ({
        ...state,
        transactions: {
          ...state.transactions,
          [chainId]: {
            ...state.transactions[chainId],
            [txHash]: transaction,
          },
        },
      }));
    },
    updateTransaction: (
      chainId: number,
      txHash: string,
      transaction: Partial<TransactionDetails>
    ) => {
      set((state) => {
        const currentTransaction = state.transactions[chainId][txHash];
        return {
          ...state,
          transactions: {
            ...state.transactions,
            [chainId]: {
              ...state.transactions[chainId],
              [txHash]: {
                ...currentTransaction,
                ...transaction,
              },
            },
          },
        };
      });
    },
  };
};
