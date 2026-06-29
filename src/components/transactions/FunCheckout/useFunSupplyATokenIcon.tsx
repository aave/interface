import { ReactNode, useState } from 'react';
import { Base64Token } from 'src/components/primitives/TokenIcon';
import { useRootStore } from 'src/store/root';

import { isFunSupplyAsset } from './funSupplyAssets';

/**
 * Generates the ringed aToken icon (underlying icon wrapped in Aave's gradient
 * TokenRing, as a base64 data URI) for fun-routed supply rows — the same image
 * the native flow registers via wallet_watchAsset (Success.tsx /
 * AddTokenDropdown pattern: hidden Base64Token + state, ready long before the
 * click). Returns the icon plus the hidden generator element the row must
 * render. Both are undefined/null for rows that aren't fun-routed.
 */
export function useFunSupplyATokenIcon(
  underlyingAsset: string,
  iconSymbol: string
): { aTokenBase64: string | undefined; generator: ReactNode } {
  const currentMarket = useRootStore((store) => store.currentMarket);
  const [aTokenBase64, setATokenBase64] = useState('');

  // Same render condition as the native flows: only fun-routed rows, and
  // Base64Token can't compose multi-part symbols (e.g. LP tokens).
  const shouldGenerate = isFunSupplyAsset(currentMarket, underlyingAsset) && !/_/.test(iconSymbol);

  const generator = shouldGenerate ? (
    <Base64Token symbol={iconSymbol} aToken onImageGenerated={setATokenBase64} />
  ) : null;

  return { aTokenBase64: aTokenBase64 || undefined, generator };
}
