import { RootStore } from './root';
import { TransactionEvent, Transactions } from './transactionsSlice';

export const selectSuccessfulTransactions = (state: RootStore) => {
  const successfulTransactions: Transactions = {};

  Object.keys(state.transactions).forEach((chainId) => {
    const chainIdNumber = +chainId;
    const successfulTxHashes = Object.keys(state.transactions[chainIdNumber]).filter(
      (txHash) => state.transactions[chainIdNumber][txHash].txState === 'success'
    );
    successfulTransactions[chainIdNumber] = successfulTxHashes.reduce<{
      [hash: string]: TransactionEvent;
    }>((acc, txHash) => {
      acc[txHash] = state.transactions[chainIdNumber][txHash];
      return acc;
    }, {});
  });

  return successfulTransactions;
};
