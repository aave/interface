import type { OrderOperation, OrderStatus as BackendOrderStatus } from '@aave/react';
import { OrderStatus } from '@cowprotocol/cow-sdk';
import { SwapType } from 'src/components/transactions/Swap/types';

const BACKEND_ORDER_STATUS: Record<BackendOrderStatus['__typename'], OrderStatus> = {
  OrderOpen: OrderStatus.OPEN,
  OrderPendingSignature: OrderStatus.PRESIGNATURE_PENDING,
  OrderFulfilled: OrderStatus.FULFILLED,
  OrderCancelled: OrderStatus.CANCELLED,
  OrderExpired: OrderStatus.EXPIRED,
};

export const historyStatusOf = (order: BackendOrderStatus) =>
  BACKEND_ORDER_STATUS[order.__typename];

/** Raw amounts the order sold and bought on CoW; debt swaps and leverage sell the new debt. */
export const tradedAmountsOf = (operation: OrderOperation) => {
  switch (operation.__typename) {
    case 'TokenSwap':
      return { sell: operation.sell.amount.raw, buy: operation.buy.amount.raw };
    case 'SupplySwap':
      return { sell: operation.sell.amount.amount.raw, buy: operation.buy.amount.amount.raw };
    case 'WithdrawSwap':
      return { sell: operation.withdraw.amount.amount.raw, buy: operation.buy.amount.raw };
    case 'BorrowSwap':
      return { sell: operation.buy.amount.amount.raw, buy: operation.sell.amount.amount.raw };
    case 'RepayWithSupply':
      return { sell: operation.supply.amount.amount.raw, buy: operation.repay.amount.amount.raw };
    case 'Leverage':
      return {
        sell: operation.debt.amount.amount.raw,
        buy: operation.collateral.amount.amount.raw,
      };
  }
};

export const swapTypeOf = (operation: OrderOperation): SwapType | undefined => {
  switch (operation.__typename) {
    case 'TokenSwap':
      return SwapType.Swap;
    case 'SupplySwap':
      return SwapType.CollateralSwap;
    case 'WithdrawSwap':
      return SwapType.WithdrawAndSwap;
    case 'BorrowSwap':
      return SwapType.DebtSwap;
    case 'RepayWithSupply':
      return SwapType.RepayWithCollateral;
    case 'Leverage':
      return SwapType.Leverage;
  }
};

type TokenInfo = {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  isAToken?: boolean;
};

export type CowAdapterEntry = {
  protocol: 'cow';
  orderId: string;
  status: OrderStatus;
  swapType: SwapType;
  chainId: number;
  account: string;
  timestamp: string; // ISO string
  srcToken: TokenInfo;
  destToken: TokenInfo;
  srcAmount: string; // raw units
  destAmount: string; // raw units
  // Adapter-specific fields for cancellation
  adapterInstanceAddress?: string; // Instance address for adapter-based swaps
  usedAdapter?: boolean; // Whether adapter was used (true for DebtSwap, RepayWithCollateral, and CollateralSwap with flashloan)
  // orderId is a backend order id, whose status comes from the backend instead of CoW.
  viaBackend?: boolean;
};

export type ParaswapAdapterEntry = {
  protocol: 'paraswap';
  txHash: string;
  swapType: SwapType;
  chainId: number;
  account: string;
  timestamp: string; // ISO string
  status: OrderStatus;
  srcToken: TokenInfo;
  destToken: TokenInfo;
  srcAmount: string; // raw units
  destAmount: string; // raw units
};

export type AdapterSwapEntry = CowAdapterEntry | ParaswapAdapterEntry;

export const isCowAdapterEntry = (entry: AdapterSwapEntry): entry is CowAdapterEntry => {
  return entry.protocol === 'cow';
};

export const isParaswapAdapterEntry = (entry: AdapterSwapEntry): entry is ParaswapAdapterEntry => {
  return entry.protocol === 'paraswap';
};

const storageKey = (chainId: number, account: string) =>
  `swapsLocalHistory:${chainId}:${account.toLowerCase()}`;

function readAll(chainId: number, account: string): AdapterSwapEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(chainId, account));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AdapterSwapEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.error('Failed to read swap adapter history', { chainId, account, error });
    return [];
  }
}

function writeAll(chainId: number, account: string, entries: AdapterSwapEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    // cap to last 200 entries per account+chain
    const capped = entries
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 200);
    localStorage.setItem(storageKey(chainId, account), JSON.stringify(capped));
  } catch (error) {
    console.error('Failed to write swap adapter history', { chainId, account, entries, error });
  }
}

export function saveCowOrderToUserHistory(entry: CowAdapterEntry) {
  const current = readAll(entry.chainId, entry.account);
  // de-duplicate by orderId
  const without = current.filter((e) => !(e.protocol === 'cow' && e.orderId === entry.orderId));
  writeAll(entry.chainId, entry.account, [entry, ...without]);
}

export function saveParaswapTxToUserHistory(entry: ParaswapAdapterEntry) {
  const current = readAll(entry.chainId, entry.account);
  // de-duplicate by txHash
  const without = current.filter(
    (e) => !(e.protocol === 'paraswap' && e.txHash.toLowerCase() === entry.txHash.toLowerCase())
  );
  writeAll(entry.chainId, entry.account, [entry, ...without]);
}

export function updateCowOrderStatus(
  chainId: number,
  account: string,
  orderId: string,
  status: OrderStatus
) {
  const current = readAll(chainId, account);
  const updated = current.map((e) =>
    e.protocol === 'cow' && e.orderId === orderId ? { ...e, status } : e
  );
  writeAll(chainId, account, updated);
}

export function updateParaswapStatus(
  chainId: number,
  account: string,
  txHash: string,
  status: OrderStatus
) {
  const current = readAll(chainId, account);
  const updated = current.map((e) =>
    e.protocol === 'paraswap' && e.txHash.toLowerCase() === txHash.toLowerCase()
      ? { ...e, status }
      : e
  );
  writeAll(chainId, account, updated);
}

export function getAdapterSwapHistory(chainId: number, account: string): AdapterSwapEntry[] {
  return readAll(chainId, account);
}
