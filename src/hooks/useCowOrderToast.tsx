import { ChainIdToNetwork } from '@aave/contract-helpers';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { toast } from 'sonner';
import {
  getOrder,
  isOrderCancelled,
  isOrderFilled,
  isOrderLoading,
} from 'src/components/transactions/Switch/cowprotocol.helpers';
import { ActionFields, TransactionHistoryItemUnion } from 'src/modules/history/types';

import { useTransactionHistory } from './useTransactionHistory';

interface OrderDetails {
  orderId: string;
  chainId: number;
  interval: NodeJS.Timeout;
}

interface CowOrderToastContextType {
  trackOrder: (orderId: string, chainId: number) => void;
  stopTracking: (orderId: string) => void;
  hasActiveOrders: boolean;
  activeOrdersCount: number;
}

const CowOrderToastContext = createContext<CowOrderToastContextType>(
  {} as CowOrderToastContextType
);

export const CowOrderToastProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [activeOrders, setActiveOrders] = useState<Map<string, OrderDetails>>(new Map());

  const { data: transactions } = useTransactionHistory({ isFilterActive: false });

  useEffect(() => {
    if (transactions && activeOrders.size === 0) {
      const cowOrders = transactions.pages[0]
        .filter((tx: TransactionHistoryItemUnion) => tx.action === 'CowSwap')
        .filter((tx: ActionFields['CowSwap']) => isOrderLoading(tx.status))
        .map((tx: TransactionHistoryItemUnion) => tx as ActionFields['CowSwap']);
      cowOrders.forEach((tx) => {
        trackOrder(tx.orderId, tx.chainId);
      });
    }
  }, [transactions, activeOrders]);

  useEffect(() => {
    return () => {
      activeOrders.forEach((order) => clearInterval(order.interval));
      activeOrders.clear();
    };
  }, [activeOrders]);

  const stopTracking = useCallback((orderId: string) => {
    setActiveOrders((prev) => {
      const order = prev.get(orderId);
      if (order) {
        clearInterval(order.interval);
        const newMap = new Map(prev);
        newMap.delete(orderId);
        return newMap;
      }
      return prev;
    });
  }, []);

  const trackOrder = useCallback(
    (orderId: string, chainId: number) => {
      // Clear any existing interval for this order
      stopTracking(orderId);

      // Start polling for order status
      const interval = setInterval(async () => {
        try {
          const order = await getOrder(orderId, chainId);

          if (isOrderFilled(order.status)) {
            toast.success('Swap completed successfully.', {
              action: {
                label: 'View',
                onClick: () =>
                  window.open(
                    `https://explorer.cow.fi/${
                      chainId === 1 ? '' : ChainIdToNetwork[chainId] + '/'
                    }orders/${orderId}`,
                    '_blank'
                  ),
              },
            });
            stopTracking(orderId);
          } else if (isOrderCancelled(order.status)) {
            toast.error('Swap could not be completed.', {
              action: {
                label: 'View',
                onClick: () =>
                  window.open(
                    `https://explorer.cow.fi/${
                      chainId === 1 ? '' : ChainIdToNetwork[chainId] + '/'
                    }orders/${orderId}`,
                    '_blank'
                  ),
              },
            });
            stopTracking(orderId);
          }
        } catch (error) {
          console.error('Error checking order status:', error);
        }
      }, 30000); // Poll every 30 seconds

      // Add to active orders
      setActiveOrders((prev) => {
        const newMap = new Map(prev);
        newMap.set(orderId, { orderId, chainId, interval });
        return newMap;
      });
    },
    [stopTracking]
  );

  return (
    <CowOrderToastContext.Provider
      value={{
        trackOrder,
        stopTracking,
        hasActiveOrders: activeOrders.size > 0,
        activeOrdersCount: activeOrders.size,
      }}
    >
      {children}
    </CowOrderToastContext.Provider>
  );
};

export const useCowOrderToast = () => {
  const context = useContext(CowOrderToastContext);
  if (!context) {
    throw new Error('useCowOrderToast must be used within a CowOrderToastProvider');
  }
  return context;
};
