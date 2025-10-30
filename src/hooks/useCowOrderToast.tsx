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
import { APP_CODE_PER_SWAP_TYPE } from 'src/components/transactions/Swap/constants/shared.constants';
import {
  generateCoWExplorerLink,
  getOrder,
  isOrderCancelled,
  isOrderFilled,
  isOrderLoading,
} from 'src/components/transactions/Swap/helpers/cow';
import { invalidateAppStateForSwap } from 'src/components/transactions/Swap/helpers/shared';
import { CowSwapSubset, TransactionHistoryItemUnion } from 'src/modules/history/types';
import { useRootStore } from 'src/store/root';
import { findTokenSymbol } from 'src/ui-config/TokenList';
import { GENERAL } from 'src/utils/events';
import { useShallow } from 'zustand/shallow';

import { useTransactionHistory } from './useTransactionHistory';

interface OrderDetails {
  appCode?: string;
  orderId: string;
  chainId: number;
  interval: NodeJS.Timeout;
  sellToken?: string;
}

interface CowOrderToastContextType {
  trackOrder: (orderId: string, chainId: number) => void;
  stopTracking: (orderId: string) => void;
  hasActiveOrders: boolean;
  setHasActiveOrders: (hasActiveOrders: boolean) => void;
  activeOrdersCount: number;
  hasActiveOrderForSellToken: (chainId: number, sellTokenAddress: string) => boolean;
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
            tx.action === 'CowSwap' ||
            tx.action === 'CowCollateralSwap' ||
            tx.action === 'CowDebtSwap' ||
            tx.action === 'CowRepayWithCollateral' ||
            tx.action === 'CowWithdrawAndSwap'
        )
        .filter((tx: CowSwapSubset) => isOrderLoading(tx.status))
        .filter((tx: CowSwapSubset) => !activeOrders.has(tx.orderId))
        .forEach((tx: CowSwapSubset) => {
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

          const orderAppCode = order.appCode;
          if (orderAppCode) {
            const swapType = Object.entries(APP_CODE_PER_SWAP_TYPE).find(
              ([, code]) => code === orderAppCode
            )?.[0] as keyof typeof APP_CODE_PER_SWAP_TYPE | undefined;

            if (swapType) {
              invalidateAppStateForSwap({
                swapType,
                chainId: order.chainId,
                account,
                queryClient,
              });
            }
          }

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
          // Store sell token for quick lookups (used to prevent permit nonce collisions)
          setActiveOrders((prev) => {
            const current = prev.get(orderId);
            if (current && current.sellToken?.toLowerCase() === order.sellToken.toLowerCase()) {
              return prev;
            }
            const updated = new Map(prev);
            updated.set(orderId, {
              ...current!,
              orderId,
              chainId,
              interval,
              sellToken: order.sellToken,
            });
            return updated;
          });
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

      // One-off fetch to populate sellToken immediately (avoid waiting for first poll)
      getOrder(orderId, chainId).then((order) => {
        setActiveOrders((prev) => {
          const existing = prev.get(orderId);
          const updated = new Map(prev);
          updated.set(orderId, {
            ...existing!,
            orderId,
            chainId,
            interval,
            sellToken: order.sellToken,
          });
          return updated;
        });
      });

      setHasActiveOrders(true);
    },
    [stopTracking]
  );

  const hasActiveOrderForSellToken = useCallback(
    (chainId: number, sellTokenAddress: string) => {
      const needle = sellTokenAddress.toLowerCase();
      for (const [, details] of activeOrders) {
        if (details.chainId === chainId && details.sellToken?.toLowerCase() === needle) {
          return true;
        }
      }
      return false;
    },
    [activeOrders]
  );

  return (
    <CowOrderToastContext.Provider
      value={{
        trackOrder,
        stopTracking,
        hasActiveOrders,
        setHasActiveOrders,
        activeOrdersCount: activeOrders.size,
        hasActiveOrderForSellToken,
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
