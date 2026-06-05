import {
  type FunkitCheckoutConfig,
  FunkitProvider,
  useActiveTheme,
  useFunkitCheckout,
} from '@funkit/connect';
import { useTheme } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useModal } from 'connectkit';
import { useCallback, useEffect, useRef } from 'react';
import { aaveTheme } from 'src/ui-config/funkit/aaveTheme';
import { funkitConfig } from 'src/ui-config/funkit/funkitConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
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
  const mode = muiTheme.palette.mode;
  const { themeColorScheme, toggleTheme } = useActiveTheme();

  const onSuccess = useCallback(() => {
    // Same refresh the native supply flow performs on tx success
    // (SupplyActions.tsx / useTransactionHandler), so the dashboard shows the
    // new aToken balance immediately after the funkit checkout completes.
    queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
    queryClient.invalidateQueries({ queryKey: queryKeysFactory.gho });
  }, [queryClient]);

  // Mid-checkout connection requests (e.g. switching the payment source to a
  // wallet) soft-hide the checkout modal and hand us a resume callback — the SDK
  // requires `onLoginFinished()` be called after login, or the modal stays
  // hidden. Stash it; the address effect below fires it once ConnectKit connects.
  const onLoginFinishedRef = useRef<(() => void) | null>(null);

  const { beginCheckout } = useFunkitCheckout({
    config: PLACEHOLDER_CONFIG,
    // funkit's own connect modal is unavailable when sharing the host wagmi
    // (no funkit wallet list), so route login through the app's ConnectKit modal.
    onLoginRequired: useCallback(
      ({ onLoginFinished }: { onLoginFinished?: () => void }) => {
        onLoginFinishedRef.current = onLoginFinished ?? null;
        setConnectModalOpen(true);
      },
      [setConnectModalOpen]
    ),
    onError: useCallback((error: unknown) => console.error('[FunkitCheckout]', error), []),
    onSuccess,
  });

  useEffect(() => {
    if (address && onLoginFinishedRef.current) {
      onLoginFinishedRef.current();
      onLoginFinishedRef.current = null;
    }
  }, [address]);

  // Keep the funkit modal's active theme in sync with the app's color mode.
  // `toggleTheme`'s identity changes on every FunkitThemeProvider render and its
  // body always sets state, so the `themeColorScheme !== mode` guard is what makes
  // this effect converge instead of update-looping.
  useEffect(() => {
    if (themeColorScheme !== mode) {
      toggleTheme(mode);
    }
  }, [mode, themeColorScheme, toggleTheme]);

  const beginSupply = async (reserve: FunSupplyReserve) => {
    // funkit checkout needs a connected wallet (read-only/watch mode has none);
    // open the app's wallet modal first.
    if (!address) {
      setConnectModalOpen(true);
      return;
    }
    const config = buildFunSupplyConfig(reserve, address);
    if (!config) {
      return;
    }
    const { isActivated } = await beginCheckout(config);
    if (!isActivated) {
      // Checkout can be remotely deactivated per API key; surface it instead
      // of failing silently.
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
  return (
    <FunkitProvider funkitConfig={funkitConfig} theme={aaveTheme} modalSize="medium">
      <InnerCheckout />
    </FunkitProvider>
  );
}

export default FunkitCheckout;
