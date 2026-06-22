import { CustomMarket } from 'src/ui-config/marketsConfig';

export const HIDDEN_ASSETS: Partial<Record<CustomMarket, string[]>> = {
  [CustomMarket.proto_horizon_v3]: [
    '0x17418038ecf73ba4026c4f428547bf099706f27b'.toLowerCase(), // aCRED
  ],
};

// Reserves can also be hidden at build/deploy time via the NEXT_PUBLIC_HIDDEN_RESERVES env var.
// It's a comma-separated list of entries where each entry is either:
//   - a bare underlying asset address: hidden in every market, e.g. `0xabc...`
//   - a `market:address` pair: hidden only in that market, e.g. `proto_mainnet_v3:0xabc...`
// Example: NEXT_PUBLIC_HIDDEN_RESERVES=0xabc...,proto_base_v3:0xdef...
const parseHiddenReservesEnv = () => {
  const global = new Set<string>();
  const byMarket: Partial<Record<CustomMarket, Set<string>>> = {};

  const raw = process.env.NEXT_PUBLIC_HIDDEN_RESERVES;
  if (!raw) {
    return { global, byMarket };
  }

  raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((entry) => {
      const [first, second] = entry.split(':').map((part) => part.trim());
      if (second) {
        const market = first as CustomMarket;
        const address = second.toLowerCase();
        if (!address) return;
        (byMarket[market] ??= new Set<string>()).add(address);
      } else if (first) {
        global.add(first.toLowerCase());
      }
    });

  return { global, byMarket };
};

const { global: ENV_HIDDEN_GLOBAL, byMarket: ENV_HIDDEN_BY_MARKET } = parseHiddenReservesEnv();

export const isAssetHidden = (market: CustomMarket, underlyingAsset: string) => {
  const address = underlyingAsset.toLowerCase();
  return Boolean(
    HIDDEN_ASSETS[market]?.includes(address) ||
      ENV_HIDDEN_GLOBAL.has(address) ||
      ENV_HIDDEN_BY_MARKET[market]?.has(address)
  );
};
