import { Trans } from '@lingui/macro';
import { Box, Button, ButtonProps } from '@mui/material';
import { ReactNode } from 'react';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

import { useFunSupplyATokenIcon } from './useFunSupplyATokenIcon';
import { useOpenFunSupply } from './useOpenFunSupply';

export type FunSupplyButtonProps = Omit<ButtonProps, 'onClick' | 'children'> & {
  /** Reserve underlying address (matched case-insensitively against the allowlist). */
  underlyingAsset: string;
  /** Reserve display name — forwarded to the native supply modal. */
  name: string;
  /** Patched display symbol of the underlying (drives the funkit checkout title). */
  symbol: string;
  /** Symbol used to generate the ringed aToken icon (can differ from `symbol`). */
  iconSymbol: string;
  /** Aave's `supplyAPY` — a 0–1 fraction. */
  supplyAPY: string | number;
  /** Whether this supply is/will be enabled as collateral for the user. */
  collateralEnabled: boolean;
  /** The user's wallet balance of the underlying. Zero routes fun assets straight to funkit. */
  walletBalance: string;
  /** Analytics funnel for the native supply modal. Defaults to `'dashboard'`. */
  funnel?: string;
  /** The native supply modal's reserve-page flag (`openSupply`'s 5th arg). Defaults to `false`. */
  isReserve?: boolean;
  /** Button label. Defaults to a translated "Supply". */
  children?: ReactNode;
};

/**
 * The Supply button. Opens the native Aave supply modal, except for allowlisted
 * fun assets the user holds none of: there's nothing to supply natively, so it
 * opens the funkit checkout (swaps, cross-chain, card, exchange) straight away.
 * Falls back to the native modal — which links to the same checkout — if funkit
 * isn't ready. Every MUI `Button` prop passes straight through.
 */
export function FunSupplyButton({
  underlyingAsset,
  name,
  symbol,
  iconSymbol,
  supplyAPY,
  collateralEnabled,
  walletBalance,
  funnel = 'dashboard',
  isReserve = false,
  children,
  ...buttonProps
}: FunSupplyButtonProps) {
  const currentMarket = useRootStore((store) => store.currentMarket);
  const { openSupply } = useModalContext();
  const openFunSupply = useOpenFunSupply();
  const hasBalance = Number(walletBalance) > 0;
  const { aTokenBase64, generator } = useFunSupplyATokenIcon(underlyingAsset, iconSymbol);

  const handleClick = () => {
    if (
      !hasBalance &&
      openFunSupply({ underlyingAsset, symbol, aTokenBase64, supplyAPY, collateralEnabled })
    ) {
      return;
    }
    openSupply(underlyingAsset, currentMarket, name, funnel, isReserve);
  };

  return (
    <>
      {/* Hidden ringed-aToken icon generator; kept out of flow (0×0 element). */}
      {generator && (
        <Box component="span" sx={{ position: 'absolute', width: 0, height: 0 }}>
          {generator}
        </Box>
      )}
      <Button variant="tertiary" size="small" {...buttonProps} onClick={handleClick}>
        {children ?? <Trans>Supply</Trans>}
      </Button>
    </>
  );
}
