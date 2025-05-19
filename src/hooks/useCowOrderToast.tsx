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
} from 'src/components/transactions/Switch/cowprotocol.helpers';

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

  // Cleanup all intervals on unmount
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
      }, 10000); // Poll every 10 seconds

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
