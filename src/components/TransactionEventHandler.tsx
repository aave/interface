// import { useEffect, useState } from 'react';
// import { useRootStore } from 'src/store/root';
// import { selectSuccessfulTransactions } from 'src/store/transactionsSelectors';
// import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
// import { GENERAL } from 'src/utils/mixPanelEvents';
// import { useShallow } from 'zustand/shallow';

export const TransactionEventHandler = () => {
  // const [postedTransactions, setPostedTransactions] = useState<{ [chainId: string]: string[] }>({});

  // const trackEvent = useRootStore((store) => store.trackEvent);
  // const successfulTransactions = useRootStore(useShallow(selectSuccessfulTransactions));

  //tx's currently tracked: supply, borrow, withdraw, repay, repay with coll, collateral switch

  // useEffect(() => {
  //   Object.keys(successfulTransactions).forEach((chainId) => {
  //     const chainIdNumber = +chainId;
  //     const networkConfig = getNetworkConfig(chainIdNumber);
  //     Object.keys(successfulTransactions[chainIdNumber]).forEach((txHash) => {
  //       if (!postedTransactions[chainIdNumber]?.includes(txHash)) {
  //         const tx = successfulTransactions[chainIdNumber][txHash];
  //         // const event = actionToEvent(tx.action);
  //         trackEvent(GENERAL.TRANSACTION, {
  //           transactionType: tx.action,
  //           tokenAmount: tx.amount,
  //           assetName: tx.assetName,
  //           asset: tx.asset,
  //           market: tx.market === null ? undefined : tx.market,
  //           txHash: txHash,
  //           proposalId: tx.proposalId,
  //           support: tx.support,
  //           previousState: tx.previousState,
  //           newState: tx.newState,
  //           outAsset: tx.outAsset,
  //           outAmount: tx.outAmount,
  //           outAssetName: tx.outAssetName,
  //           amountUsd: tx.amountUsd,
  //           outAmountUsd: tx.outAmountUsd,
  //           chainId: chainIdNumber,
  //           chainName: networkConfig.displayName || networkConfig.name,
  //         });

  //         // update local state
  //         if (postedTransactions[chainIdNumber]) {
  //           setPostedTransactions((prev) => ({
  //             ...prev,
  //             [chainIdNumber]: [...prev[chainIdNumber], txHash],
  //           }));
  //         } else {
  //           setPostedTransactions((prev) => ({
  //             ...prev,
  //             [+chainId]: [txHash],
  //           }));
  //         }
  //       }
  //     });
  //   });
  // }, [trackEvent, postedTransactions, successfulTransactions]);

  return null;
};
