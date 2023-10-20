import { ProtocolAction } from '@aave/contract-helpers';
import { produce } from 'immer';
import { CustomMarket } from 'src/ui-config/marketsConfig';
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
  amountUsd?: string;
  assetName?: string;
  proposalId?: number;
  support?: boolean;
  previousState?: string;
  newState?: string;
  spender?: string;
  outAsset?: string;
  outAmount?: string;
  outAmountUsd?: string;
  outAssetName?: string;
};

export type TransactionEvent = TransactionDetails & {
  market: string | null;
};

type TransactionState = 'success' | 'failed';

type TransactionContext = {
  market?: CustomMarket | null;
  chainId?: number;
};

export interface TransactionsSlice {
  transactions: Transactions;
  addTransaction: (
    txHash: string,
    transaction: TransactionDetails,
    context?: TransactionContext
  ) => void;
}

export const createTransactionsSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  TransactionsSlice
> = (set, get) => {
  return {
    transactions: [],
    addTransaction: (txHash, transaction, context = {}) => {
      const chainId = context.chainId ?? get().currentChainId;
      const market = context.market === undefined ? get().currentMarket : context.market;
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
