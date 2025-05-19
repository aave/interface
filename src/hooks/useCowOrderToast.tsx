import { ChainIdToNetwork } from '@aave/contract-helpers';
import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { toast } from 'sonner';
import {
  getOrder,
  isOrderCancelled,
  isOrderFilled,
} from 'src/components/transactions/Switch/cowprotocol.helpers';

interface OrderDetails {
  orderId: string;
  chainId: number;
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
  const [trackedOrders, setTrackedOrders] = useState<Map<string, NodeJS.Timeout>>(new Map());
  const [activeOrders, setActiveOrders] = useState<Map<string, OrderDetails>>(new Map());

  const trackOrder = (orderId: string, chainId: number) => {
    // Clear any existing interval for this order
    stopTracking(orderId);

    // Add to active orders
    setActiveOrders((prev) => new Map(prev).set(orderId, { orderId, chainId }));

    // Start polling for order status
    const interval = setInterval(async () => {
      try {
        const order = await getOrder(orderId, chainId);

        if (isOrderFilled(order.status)) {
          toast.success('You have successfully swapped your assets.', {
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
          toast.error('Your swap could not be completed.', {
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

    setTrackedOrders((prev) => new Map(prev).set(orderId, interval));
  };

  const stopTracking = (orderId: string) => {
    const interval = trackedOrders.get(orderId);
    if (interval) {
      clearInterval(interval);
      setTrackedOrders((prev) => {
        const newMap = new Map(prev);
        newMap.delete(orderId);
        return newMap;
      });
      // Remove from active orders
      setActiveOrders((prev) => {
        const newMap = new Map(prev);
        newMap.delete(orderId);
        return newMap;
      });
    }
  };

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
  if (context === undefined) {
    throw new Error('useCowOrderToast must be used within a CowOrderToastProvider');
  }
  return context;
};
