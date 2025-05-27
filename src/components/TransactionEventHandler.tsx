import { useEffect, useRef } from 'react';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

export const TransactionEventHandler = () => {
  const postedTransactionsRef = useRef<{ [chainId: string]: string[] }>({});

  const trackEvent = useRootStore((store) => store.trackEvent);
  const transactions = useRootStore((store) => store.transactions);

  //tx's currently tracked: supply, borrow, withdraw, repay, repay with coll, collateral switch

  useEffect(() => {
    Object.keys(transactions).forEach((chainId) => {
      const chainIdNumber = +chainId;
      const networkConfig = getNetworkConfig(chainIdNumber);

      Object.keys(transactions[chainIdNumber] || {}).forEach((txHash) => {
        const tx = transactions[chainIdNumber][txHash];

        // Only process successful transactions that haven't been posted yet
        if (
          tx.txState === 'success' &&
          !postedTransactionsRef.current[chainIdNumber]?.includes(txHash)
        ) {
          trackEvent(GENERAL.TRANSACTION, {
            transactionType: tx.action,
            tokenAmount: tx.amount,
            assetName: tx.assetName,
            asset: tx.asset,
            market: tx.market === null ? undefined : tx.market,
            txHash: txHash,
            proposalId: tx.proposalId,
            support: tx.support,
            previousState: tx.previousState,
            newState: tx.newState,
            outAsset: tx.outAsset,
            outAmount: tx.outAmount,
            outAssetName: tx.outAssetName,
            amountUsd: tx.amountUsd,
            outAmountUsd: tx.outAmountUsd,
            chainId: chainIdNumber,
            chainName: networkConfig.displayName || networkConfig.name,
          });

          // update ref
          if (postedTransactionsRef.current[chainIdNumber]) {
            postedTransactionsRef.current[chainIdNumber].push(txHash);
          } else {
            postedTransactionsRef.current[chainIdNumber] = [txHash];
          }
        }
      });
    });
  }, [trackEvent, transactions]);

  return null;
};
