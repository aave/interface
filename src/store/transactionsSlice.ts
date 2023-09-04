import { ProtocolAction } from '@aave/contract-helpers';
import { produce } from 'immer';
import { StateCreator } from 'zustand';

import { RootStore } from './root';

export type Transactions = {
  [chainId: number]: {
    [hash: string]: TransactionEvent;
  };
};

export type TransactionDetails = {
  action?: ProtocolAction | string;
  txState?: TransactionState;
  asset?: string;
  amount?: string;
  assetName?: string;
  proposalId?: number;
  support?: boolean;
  previousState?: string;
  newState?: string;
  spender?: string;
  outAsset?: string;
  outAmount?: string;
  outAssetName?: string;
};

export type TransactionEvent = TransactionDetails & {
  market: string;
};

type TransactionState = 'success' | 'failed';

export interface TransactionsSlice {
  transactions: Transactions;
  addTransaction: (txHash: string, transaction: TransactionDetails) => void;
}

export const createTransactionsSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  TransactionsSlice
> = (set, get) => {
  return {
    transactions: [],
    addTransaction: (txHash, transaction) => {
      const chainId = get().currentChainId;
      const market = get().currentMarket;
      set((state) =>
        produce(state, (draft) => {
          draft.transactions[chainId] = {
            ...draft.transactions[chainId],
            [txHash]: {
              ...transaction,
              market,
            },
          };
        })
      );
    },
  };
};
