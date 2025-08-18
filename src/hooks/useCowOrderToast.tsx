import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import {
  generateCoWExplorerLink,
  getOrder,
  isOrderCancelled,
  isOrderFilled,
  isOrderLoading,
} from 'src/components/transactions/Switch/cowprotocol.helpers';
import { ActionFields, TransactionHistoryItemUnion } from 'src/modules/history/types';
import { useRootStore } from 'src/store/root';
import { findByChainId } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { findTokenSymbol } from 'src/ui-config/TokenList';
import { GENERAL } from 'src/utils/events';
import { useShallow } from 'zustand/shallow';

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
  setHasActiveOrders: (hasActiveOrders: boolean) => void;
  activeOrdersCount: number;
}

const CowOrderToastContext = createContext<CowOrderToastContextType>(
  {} as CowOrderToastContextType
);

export const CowOrderToastProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [activeOrders, setActiveOrders] = useState<Map<string, OrderDetails>>(new Map());
  const processedOrdersRef = useRef<Set<string>>(new Set());
  const { data: transactions } = useTransactionHistory({ isFilterActive: false });
  const [hasActiveOrders, setHasActiveOrders] = useState(false);
  const queryClient = useQueryClient();
  const { account, currentMarketData, trackEvent } = useRootStore(
    useShallow((store) => ({
      account: store.account,
      currentMarketData: store.currentMarketData,
      trackEvent: store.trackEvent,
    }))
  );

  useEffect(() => {
    setHasActiveOrders(activeOrders.size > 0);
  }, [activeOrders]);

  // Load orders from transaction history (e.g. on page load)
  useEffect(() => {
    if (transactions?.pages[0] && activeOrders.size === 0) {
      transactions.pages[0]
        .filter(
          (tx: TransactionHistoryItemUnion) =>
            tx.action === 'CowSwap' || tx.action === 'CowCollateralSwap'
        )
        .filter((tx: ActionFields['CowSwap']) => isOrderLoading(tx.status))
        .map((tx: TransactionHistoryItemUnion) => tx as ActionFields['CowSwap'])
        .filter((tx: ActionFields['CowSwap']) => !activeOrders.has(tx.orderId))
        .forEach((tx: ActionFields['CowSwap']) => {
          trackOrder(tx.orderId, tx.chainId);
        });
    }
  }, [transactions?.pages[0]]);

  const stopTracking = useCallback(
    (orderId: string) => {
      setActiveOrders((prev) => {
        const order = prev.get(orderId);
        if (order) {
          clearInterval(order.interval);
          const newMap = new Map(prev);
          newMap.delete(orderId);

          queryClient.invalidateQueries({
            queryKey: queryKeysFactory.poolReservesDataHumanized(
              findByChainId(order.chainId) ?? currentMarketData
            ),
          });

          queryClient.invalidateQueries({
            queryKey: queryKeysFactory.userPoolReservesDataHumanized(
              account,
              findByChainId(order.chainId) ?? currentMarketData
            ),
          });

          queryClient.invalidateQueries({
            queryKey: queryKeysFactory.transactionHistory(
              account,
              findByChainId(order.chainId) ?? currentMarketData
            ),
          });

          queryClient.invalidateQueries({
            queryKey: queryKeysFactory.poolTokens(account, currentMarketData),
          });

          if (newMap.size === 0) {
            setHasActiveOrders(false);
          }

          return newMap;
        }

        return prev;
      });
    },
    [queryClient, account, currentMarketData]
  );

  const trackOrder = useCallback(
    (orderId: string, chainId: number) => {
      // Clear any existing interval for this order
      stopTracking(orderId);

      // Start polling for order status
      const interval = setInterval(async () => {
        try {
          const order = await getOrder(orderId, chainId);
          const baseTrackingData = {
            chainId,
            inputSymbol: order.sellToken,
            outputSymbol: order.buyToken,
            pair: `${findTokenSymbol(order.sellToken, chainId) ?? 'custom'}-${
              findTokenSymbol(order.buyToken, chainId) ?? 'custom'
            }`,
          };

          if (isOrderFilled(order.status) && !processedOrdersRef.current.has(orderId)) {
            processedOrdersRef.current.add(orderId);
            toast.success('Swap completed successfully.', {
              action: {
                label: 'View',
                onClick: () => window.open(generateCoWExplorerLink(chainId, orderId), '_blank'),
              },
            });
            stopTracking(orderId);

            trackEvent(GENERAL.SWAP_COMPLETED, {
              ...baseTrackingData,
              executedAmount: order.executedBuyAmount,
              executedFee: order.executedFee,
            });
          } else if (isOrderCancelled(order.status) && !processedOrdersRef.current.has(orderId)) {
            processedOrdersRef.current.add(orderId);
            toast.error('Swap could not be completed.', {
              action: {
                label: 'View',
                onClick: () => window.open(generateCoWExplorerLink(chainId, orderId), '_blank'),
              },
            });
            stopTracking(orderId);

            trackEvent(GENERAL.SWAP_FAILED, {
              ...baseTrackingData,
              quoteId: order.quoteId ?? undefined,
              buyAmout: order.buyAmount,
            });
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

      setHasActiveOrders(true);
    },
    [stopTracking]
  );

  return (
    <CowOrderToastContext.Provider
      value={{
        trackOrder,
        stopTracking,
        hasActiveOrders,
        setHasActiveOrders,
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
