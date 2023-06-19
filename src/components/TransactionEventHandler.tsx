import { ProtocolAction } from '@aave/contract-helpers';
import { useEffect, useState } from 'react';
import { useRootStore } from 'src/store/root';
import { selectSuccessfulTransactions } from 'src/store/transactionsSelectors';
import { BORROW_MODAL, REPAY_MODAL, SUPPLY_MODAL } from 'src/utils/mixPanelEvents';

export const TransactionEventHandler = () => {
  const [postedTransactions, setPostedTransactions] = useState<{ [chainId: string]: string[] }>({});

  const { trackEvent } = useRootStore();
  const successfulTransactions = useRootStore(selectSuccessfulTransactions);

  const actionToEvent = (action: ProtocolAction) => {
    switch (action) {
      case ProtocolAction.supply:
        return SUPPLY_MODAL.SUPPLY_TOKEN;
      case ProtocolAction.supplyWithPermit:
        return SUPPLY_MODAL.SUPPLY_WITH_PERMIT;
      case ProtocolAction.borrow:
        return BORROW_MODAL.BORROW_TOKEN;
      case ProtocolAction.repay:
        return REPAY_MODAL.REPAY_TOKEN;
      default:
        return '';
    }
  };

  useEffect(() => {
    Object.keys(successfulTransactions).forEach((chainId) => {
      const chainIdNumber = +chainId;
      Object.keys(successfulTransactions[chainIdNumber]).forEach((txHash) => {
        if (!postedTransactions[chainIdNumber]?.includes(txHash)) {
          const tx = successfulTransactions[chainIdNumber][txHash];

          const event = actionToEvent(tx.action);
          trackEvent(event, {
            amount: tx.amount,
            asset: tx.asset,
            market: tx.market,
            txHash: txHash,
          });

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
