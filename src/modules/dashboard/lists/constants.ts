import { CustomMarket } from 'src/ui-config/marketsConfig';

export const HIDDEN_ASSETS: Partial<Record<CustomMarket, string[]>> = {
  [CustomMarket.proto_horizon_v3]: [
    '0x17418038ecf73ba4026c4f428547bf099706f27b'.toLowerCase(), // aCRED
    '0x7433806912Eae67919e66aea853d46Fa0aef98A8'.toLowerCase(),
  ],
};

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
