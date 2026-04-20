'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRootStore } from 'src/store/root';
import { useAccount } from 'wagmi';

import { checkCompliance } from './service-compliance';
import { useLocalStorageState } from './useLocalStorageState';

const STORAGE_KEY = 'compliance-state-v2';
const MIN_REFRESH_MS = 60 * 1000; // 1 minute minimum between checks

export type ComplianceStatus = 'idle' | 'loading' | 'compliant' | 'non-compliant' | 'error';

type ComplianceState = {
  status: ComplianceStatus;
  address: string | null;
  nextCheck: string | null;
  errorMessage?: string;
};

type ComplianceContextValue = {
  status: ComplianceStatus;
  address: string | null;
  errorMessage?: string;
  recheck: () => Promise<void>;
};

type PersistedComplianceState = {
  [address: string]: {
    result: boolean;
    nextCheck: string;
    useV37?: {
      wethGateway: string;
      uiPoolDataProvider: string;
    };
  };
};

const ComplianceContext = createContext<ComplianceContextValue>({
  status: 'idle',
  address: null,
  recheck: () => Promise.resolve(),
});

const isExpired = (nextCheck: string | null): boolean => {
  if (!nextCheck) return true;
  return new Date(nextCheck).getTime() < Date.now();
};

export const ComplianceProvider = ({ children }: { children: React.ReactNode }) => {
  const { address, isConnected } = useAccount();
  const setV37Overrides = useRootStore((state) => state.setV37Overrides);

  const [cache, setCache] = useLocalStorageState<PersistedComplianceState>(STORAGE_KEY, {
    defaultValue: {},
  });

  const [state, setState] = useState<ComplianceState>({
    status: 'idle',
    address: null,
    nextCheck: null,
  });

  const isCheckingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef(cache);

  // Keep cacheRef in sync
  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  const performCheck = useCallback(
    async (walletAddress: string, isBackground = false) => {
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;

      if (!isBackground) {
        setState((prev) => ({
          ...prev,
          status: 'loading',
          address: walletAddress,
        }));
      }

      try {
        const response = await checkCompliance(walletAddress);
        if (response.success && response.data) {
          const newStatus = response.data.result ? 'compliant' : 'non-compliant';

          setState({
            status: newStatus,
            address: walletAddress,
            nextCheck: response.data.nextCheck,
            errorMessage: undefined,
          });

          if (response.data.useV37) {
            setV37Overrides({
              WETH_GATEWAY: response.data.useV37.wethGateway,
              UI_POOL_DATA_PROVIDER: response.data.useV37.uiPoolDataProvider,
            });
          } else {
            setV37Overrides(null);
          }

          // Update cache for this address
          setCache((prev) => ({
            ...prev,
            [walletAddress.toLowerCase()]: {
              result: response.data!.result,
              nextCheck: response.data!.nextCheck,
              useV37: response.data!.useV37,
            },
          }));

          // Schedule next check based on nextCheck time
          if (response.data.result) {
            const msUntilNextCheck = Math.max(
              new Date(response.data.nextCheck).getTime() - Date.now(),
              MIN_REFRESH_MS
            );
            timeoutRef.current = setTimeout(() => {
              performCheck(walletAddress, true);
            }, msUntilNextCheck);
          }
        } else {
          setState((prev) => ({
            ...prev,
            status: isBackground && prev.status !== 'loading' ? prev.status : 'error',
            errorMessage: response.error,
          }));
        }
      } catch {
        setState((prev) => ({
          ...prev,
          status: isBackground && prev.status !== 'loading' ? prev.status : 'error',
          errorMessage: 'Unexpected error during compliance check',
        }));
      } finally {
        isCheckingRef.current = false;
      }
    },
    [setCache, setV37Overrides]
  );

  const recheck = useCallback(async () => {
    if (address) {
      await performCheck(address, false);
    }
  }, [address, performCheck]);

  // Check compliance when wallet connects or address changes
  useEffect(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!isConnected || !address) {
      setState({ status: 'idle', address: null, nextCheck: null });
      return;
    }

    const addressLower = address.toLowerCase();
    const cached = cacheRef.current[addressLower];

    if (cached && !isExpired(cached.nextCheck)) {
      // Valid cache exists
      setState({
        status: cached.result ? 'compliant' : 'non-compliant',
        address,
        nextCheck: cached.nextCheck,
      });

      if (cached.useV37) {
        setV37Overrides({
          WETH_GATEWAY: cached.useV37.wethGateway,
          UI_POOL_DATA_PROVIDER: cached.useV37.uiPoolDataProvider,
        });
      } else {
        setV37Overrides(null);
      }

      // Schedule refresh at nextCheck time
      if (cached.result) {
        const msUntilNextCheck = Math.max(
          new Date(cached.nextCheck).getTime() - Date.now(),
          MIN_REFRESH_MS
        );
        timeoutRef.current = setTimeout(() => {
          performCheck(address, true);
        }, msUntilNextCheck);
      }
    } else {
      // No valid cache - perform blocking check
      performCheck(address, false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [address, isConnected, performCheck]);

  // Tab focus handler - recheck if expired when user returns
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && address && isExpired(state.nextCheck)) {
        performCheck(address, false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [address, state.nextCheck, performCheck]);

  const contextValue: ComplianceContextValue = {
    status: state.status,
    address: state.address,
    errorMessage: state.errorMessage,
    recheck,
  };

  return <ComplianceContext.Provider value={contextValue}>{children}</ComplianceContext.Provider>;
};

export const useCompliance = () => useContext(ComplianceContext);
