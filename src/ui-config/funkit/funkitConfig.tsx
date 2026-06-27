import { ChainId } from '@aave/contract-helpers';
import { AaveV3Ethereum } from '@aave-dao/aave-address-book';
import { type FunkitConfig } from '@funkit/connect';
import { networkConfigs } from 'src/ui-config/networksConfig';

/**
 * funkit checkout configuration for the Aave interface.
 *
 * Mirrors the production Polymarket integration (Polymarket/polymarket-next
 * `utils/constants/funkit.ts`) and the funkit playground's `aave` customer
 * (`with-next/configs/customers.tsx`). The matching theme lives in
 * `./aaveTheme` (ported from `with-next/themes/aave.ts`).
 *
 * The API key comes from `NEXT_PUBLIC_FUNKIT_API_KEY` (per the repo no-secrets
 * rule); checkout is non-functional without it.
 */
export const funkitConfig: FunkitConfig = {
  appName: 'Aave',
  apiKey: process.env.NEXT_PUBLIC_FUNKIT_API_KEY || '',
  uiCustomizations: {
    alignTitle: 'left',
    // Fonts for the embedded fiat-card (Swapped) widget — separate from the modal
    // theme's `customFontFamily`. Named font, lowercase (Polymarket does the same;
    // this app's font is Inter too).
    customFontFamily: {
      primary: 'inter',
    },
    confirmationScreen: {
      showSelectedRoute: true,
      destinationConfig: {
        // Served from this repo's public/ dir — same asset (and root-absolute
        // path convention) as TokenIcon.
        icon: <img src="/icons/tokens/aave.svg" alt="Aave V3" />,
        text: 'Aave V3',
        // The supply mints aTokens to the user's own wallet; point the label at
        // the Aave V3 mainnet Pool contract the checkout routes through
        // (same source funSupplyAssets uses).
        url: `${networkConfigs[ChainId.mainnet].explorerLink}/address/${AaveV3Ethereum.POOL}`,
      },
    },
  },
};
