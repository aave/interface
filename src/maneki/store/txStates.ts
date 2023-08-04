import create from 'zustand';

import { ITxStatus } from '../hooks/leverage-data-provider/LeverageDataProvider';

export interface ITxStateStore {
  txState: ITxStatus;
  setTxState: (newTxState: ITxStatus) => void;
}

export const useTxStateStore = create<ITxStateStore>()((set) => ({
  txState: {
    status: '',
    message: '',
    hash: '',
  },
  setTxState: (newTxState: ITxStatus) => {
    set({ txState: newTxState });
  },
}));
