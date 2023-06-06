import { useEffect, useState } from 'react';
import { useRootStore } from 'src/store/root';
import { selectSuccessfulTransactions } from 'src/store/transactionsSelectors';
import { TransactionDetails } from 'src/store/transactionsSlice';
import { BORROW_MODAL, REPAY_MODAL, SUPPLY_MODAL } from 'src/utils/mixPanelEvents';

export const TransactionEventHandler = () => {
  const [postedTransactions, setPostedTransactions] = useState<{ [chainId: string]: string[] }>({});

  const { trackEvent } = useRootStore();
  const successfulTransactions = useRootStore(selectSuccessfulTransactions);

  const actionToEvent = (action: string, tx: TransactionDetails) => {
    switch (action) {
      case 'supply': {
        return trackEvent(SUPPLY_MODAL.SUPPLY_TOKEN, {
          amount: tx.amount,
          asset: tx.asset,
          market: tx.market,
        });
      }

      case 'supplyWithPermit': {
        return trackEvent(SUPPLY_MODAL.SUPPLY_WITH_PERMIT, {
          amount: tx.amount,
          asset: tx.asset,
          market: tx.market,
        });
      }

      case 'borrow': {
        return trackEvent(BORROW_MODAL.BORROW_TOKEN, {
          amount: tx.amount,
          asset: tx.asset,
          market: tx.market,
        });
      }

      case 'repay': {
        return trackEvent(REPAY_MODAL.REPAY_TOKEN, {
          amount: tx.amount,
          asset: tx.asset,
          market: tx.market,
        });
      }
      // todo rest
      default:
        null;
    }
  };

  useEffect(() => {
    Object.keys(successfulTransactions).forEach((chainId) => {
      const chainIdNumber = +chainId;
      Object.keys(successfulTransactions[chainIdNumber]).forEach((txHash) => {
        if (!postedTransactions[chainIdNumber]?.includes(txHash)) {
          const tx = successfulTransactions[chainIdNumber][txHash];

          actionToEvent(tx.action, tx);
          // trackEvent(tx.action || ''); // TODO: what else do we want to track for each transaction?

          // update local state
          if (postedTransactions[chainIdNumber]) {
            setPostedTransactions((prev) => ({
              ...prev,
              [chainIdNumber]: [...prev[chainIdNumber], txHash],
            }));
          } else {
            setPostedTransactions((prev) => ({
              ...prev,
              [+chainId]: [txHash],
            }));
          }
        }
      });
    });
  }, [trackEvent, postedTransactions, successfulTransactions]);

  return null;
};
