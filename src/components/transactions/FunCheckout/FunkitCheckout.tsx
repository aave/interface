import {
  type FunkitCheckoutConfig,
  type FunkitCheckoutResult,
  type FunkitCheckoutValidationResult,
  FunkitProvider,
  useActiveTheme,
  useFunkitCheckout,
} from '@funkit/connect';
import { useTheme } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useModal } from 'connectkit';
import { useCallback, useEffect, useRef } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { aaveTheme } from 'src/ui-config/funkit/aaveTheme';
import { funkitConfig } from 'src/ui-config/funkit/funkitConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { FUNKIT } from 'src/utils/events';
import { calculateHFAfterSupply } from 'src/utils/hfUtils';
import { getAddress } from 'viem';
import { useAccount } from 'wagmi';

import { buildFunSupplyConfig, FunSupplyReserve } from './funSupplyAssets';
import { registerFunSupply } from './funSupplyBridge';

/**
 * funkit checkout host. Mounted once in `_app` alongside the app's other modal
 * hosts (SupplyModal etc.), as an `ssr: false` island — `@funkit/connect` is
 * client-only. `FunkitProvider` is mounted WITHOUT a `wagmiConfig`/`queryClient`,
 * so it reuses the interface's existing wagmi + react-query (and the wallet the
 * user connected via ConnectKit).
 *
 * `InnerCheckout` runs inside the provider, owns the single `useFunkitCheckout`
 * instance, and registers `beginSupply` on the module bridge (`funSupplyBridge`)
 * for the Supply buttons to invoke. Per-asset configs are passed at call time
 * via funkit's supported `beginCheckout(configOverride)`.
 */

const FUNKIT_POLL_INTERVAL = 5_000;

// Placeholder config for the hook — never opened directly; every `beginCheckout`
// call passes a full per-asset override built by `buildFunSupplyConfig`.
const PLACEHOLDER_CONFIG: FunkitCheckoutConfig = {
  checkoutItemTitle: '',
  targetAsset: getAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
  targetAssetTicker: '',
  targetChain: '1',
};

function InnerCheckout() {
  const { address } = useAccount();
  const { setOpen: setConnectModalOpen } = useModal();
  const queryClient = useQueryClient();
  const muiTheme = useTheme();
  const { toggleTheme } = useActiveTheme();
  const trackEvent = useRootStore((store) => store.trackEvent);

  // Live position + reserves for the health-factor preview. Kept in a ref so the
  // `resolveHealthFactor` closure handed to funkit reads the latest values when
  // the confirmation screen calls it — not a snapshot from config-build time.
  const { user, reserves } = useAppDataContext();
  const appDataRef = useRef({ user, reserves });
  useEffect(() => {
    appDataRef.current = { user, reserves };
  });

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // The reserve of the in-flight checkout, so success/error events can carry
  // asset context. Set when a checkout begins; the funkit callbacks read it.
  const activeReserveRef = useRef<FunSupplyReserve | null>(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
    queryClient.invalidateQueries({ queryKey: queryKeysFactory.gho });
  }, [queryClient]);

  const startPolling = useCallback(() => {
    stopPolling();
    pollIntervalRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
    }, FUNKIT_POLL_INTERVAL);
  }, [queryClient, stopPolling]);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  const onSuccess = useCallback(
    (result: FunkitCheckoutResult) => {
      stopPolling();
      const reserve = activeReserveRef.current;
      trackEvent(FUNKIT.CHECKOUT_COMPLETED, {
        asset: reserve?.underlyingAsset,
        assetSymbol: reserve?.symbol,
        chainId: reserve?.chainId,
        message: result.message,
      });
      activeReserveRef.current = null;
    },
    [stopPolling, trackEvent]
  );

  // Mid-checkout connection requests (e.g. switching the payment source to a
  // wallet) soft-hide the checkout modal and hand us a resume callback — the SDK
  // requires `onLoginFinished()` be called after login, or the modal stays
  // hidden. Stash it; the address effect below fires it once ConnectKit connects.
  const onLoginFinishedRef = useRef<(() => void) | null>(null);

  const { beginCheckout } = useFunkitCheckout({
    config: PLACEHOLDER_CONFIG,
    // `activeReserveRef` is set in `beginSupply` before `beginCheckout`, so the
    // in-flight reserve is available by the time the config finishes validating.
    onValidation: useCallback(
      (result: FunkitCheckoutValidationResult) => {
        const reserve = activeReserveRef.current;
        trackEvent(FUNKIT.CHECKOUT_STARTED, {
          asset: reserve?.underlyingAsset,
          assetSymbol: reserve?.symbol,
          chainId: reserve?.chainId,
          isValid: result.isValid,
          message: result.message,
        });
      },
      [trackEvent]
    ),
    // funkit's own connect modal is unavailable when sharing the host wagmi
    // (no funkit wallet list), so route login through the app's ConnectKit modal.
    onLoginRequired: useCallback(
      ({ onLoginFinished }: { onLoginFinished?: () => void }) => {
        // FunkitProvider shares the host wagmi (mounted without its own config),
        // so when the host wallet is already connected there is nothing to log
        // into — resume the checkout immediately. Opening ConnectKit here would
        // run a redundant connect on the shared config that can stick at
        // `status: 'connecting'`, where `address` stays set but `isConnected`
        // becomes false. That leaves the wallet button looking connected while
        // re-opening the *connect* modal instead of the wallet options.
        if (address) {
          onLoginFinished?.();
          return;
        }
        onLoginFinishedRef.current = onLoginFinished ?? null;
        setConnectModalOpen(true);
      },
      [address, setConnectModalOpen]
    ),
    onError: useCallback(
      (result: FunkitCheckoutResult) => {
        console.error('[FunkitCheckout]', result);
        const reserve = activeReserveRef.current;
        trackEvent(FUNKIT.CHECKOUT_ERROR, {
          asset: reserve?.underlyingAsset,
          assetSymbol: reserve?.symbol,
          chainId: reserve?.chainId,
          message: result.message,
        });
        activeReserveRef.current = null;
      },
      [trackEvent]
    ),
    onSuccess,
    onClose: stopPolling,
  });

  useEffect(() => {
    if (address && onLoginFinishedRef.current) {
      onLoginFinishedRef.current();
      onLoginFinishedRef.current = null;
    }
  }, [address]);

  const colorMode = muiTheme.palette.mode;

  useEffect(() => {
    const persisted = (localStorage?.getItem('colorMode') as 'light' | 'dark') || colorMode;
    toggleTheme(persisted);
  }, [colorMode, toggleTheme]);

  const beginSupply = async (reserve: FunSupplyReserve) => {
    // funkit checkout needs a connected wallet (read-only/watch mode has none);
    // open the app's wallet modal first.
    if (!address) {
      setConnectModalOpen(true);
      return;
    }
    // Compute health factor (before → after) from live app-data, so the funkit
    // confirmation screen shows the same number as the dashboard. Bound to this
    // reserve's underlying; reads the latest position via `appDataRef`.
    const resolveHealthFactor = (underlyingHumanAmount: string) => {
      const { user, reserves } = appDataRef.current;
      const poolReserve = reserves.find(
        (r) => r.underlyingAsset.toLowerCase() === reserve.underlyingAsset.toLowerCase()
      );
      if (!user || !poolReserve) {
        return null;
      }
      const amountInEth = new BigNumber(underlyingHumanAmount).multipliedBy(
        poolReserve.formattedPriceInMarketReferenceCurrency
      );
      if (!amountInEth.isFinite() || amountInEth.lte(0)) {
        return null;
      }
      return {
        before: user.healthFactor,
        after: calculateHFAfterSupply(user, poolReserve, amountInEth).toString(),
      };
    };

    const config = buildFunSupplyConfig(reserve, address, resolveHealthFactor);
    if (!config) {
      return;
    }
    activeReserveRef.current = reserve;
    startPolling();
    const { isActivated } = await beginCheckout(config);
    if (!isActivated) {
      stopPolling();
      activeReserveRef.current = null;
      console.warn('[FunkitCheckout] checkout is not activated for this API key');
    }
  };

  // Register on the bridge once; the ref keeps the registered wrapper pointing
  // at the latest impl without re-registering each render. The catch keeps a
  // beginCheckout rejection from surfacing as an unhandled rejection (the bridge
  // is fire-and-forget).
  const beginSupplyRef = useRef(beginSupply);
  useEffect(() => {
    beginSupplyRef.current = beginSupply;
  });
  useEffect(
    () =>
      registerFunSupply((reserve) => {
        beginSupplyRef.current(reserve).catch((error) => console.error('[FunkitCheckout]', error));
      }),
    []
  );

  return null;
}

export function FunkitCheckout() {
  // Wait for wagmi to finish reconnecting before mounting FunkitProvider.
  // FunkitProviderInner calls useAccountEffect({ onDisconnect }) internally,
  // which fires during the transient disconnected→reconnecting→connected cycle
  // on page refresh and clears WALLETCONNECT_DEEPLINK_CHOICE from localStorage,
  // corrupting the wallet connection state.
  const { status } = useAccount();
  const isReconnecting = status === 'reconnecting' || status === 'connecting';

  if (!funkitConfig.apiKey || isReconnecting) {
    return null;
  }

  return (
    <FunkitProvider funkitConfig={funkitConfig} theme={aaveTheme} modalSize="medium">
      <InnerCheckout />
    </FunkitProvider>
  );
}

export default FunkitCheckout;
