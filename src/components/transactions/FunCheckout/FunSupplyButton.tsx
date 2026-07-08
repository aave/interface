import { Trans } from '@lingui/macro';
import { Box, Button, ButtonProps } from '@mui/material';
import { ReactNode } from 'react';

import { useFunSupplyATokenIcon } from './useFunSupplyATokenIcon';
import { useSupplyButtonAction } from './useSupplyButtonAction';

export type FunSupplyButtonProps = Omit<ButtonProps, 'onClick' | 'children'> & {
  /** Reserve underlying address (matched case-insensitively against the allowlist). */
  underlyingAsset: string;
  /** Reserve display name — forwarded to the native supply modal fallback. */
  name: string;
  /** Patched display symbol of the underlying (drives the funkit checkout title). */
  symbol: string;
  /**
   * Symbol used to generate the ringed aToken icon. Often equals `symbol`, but
   * can differ (e.g. wrapped tokens), so it's passed explicitly.
   */
  iconSymbol: string;
  /** Aave's `supplyAPY` — a 0–1 fraction. */
  supplyAPY: string | number;
  /** Collateral flag shown in the funkit checkout (`collateralizationEnabled`). */
  collateralEnabled: boolean;
  /** Analytics funnel for the native supply modal fallback. Defaults to `'dashboard'`. */
  funnel?: string;
  /** The native supply modal's reserve-page flag (`openSupply`'s 5th arg). Defaults to `false`. */
  isReserve?: boolean;
  /** Button label. Defaults to a translated "Supply". */
  children?: ReactNode;
};

/**
 * The Supply button, everywhere. It owns the funkit branch so individual call
 * sites can't forget it: renders the hidden ringed-aToken icon generator and
 * routes the click through `useSupplyButtonAction` (funkit checkout for the
 * allowlisted Core-mainnet assets, native Aave supply modal otherwise). Every
 * MUI `Button` prop (`sx`, `variant`, `disabled`, `fullWidth`, `data-cy`, …)
 * passes straight through, so it drops into any layout.
 *
 * Adding a new Supply entry point? Render this instead of calling `openSupply`
 * directly — keeping the funkit branch in one place is the whole point (ENG-4228).
 */
export function FunSupplyButton({
  underlyingAsset,
  name,
  symbol,
  iconSymbol,
  supplyAPY,
  collateralEnabled,
  funnel,
  isReserve,
  children,
  ...buttonProps
}: FunSupplyButtonProps) {
  const handleSupplyClick = useSupplyButtonAction({ funnel, isReserve });
  const { aTokenBase64, generator } = useFunSupplyATokenIcon(underlyingAsset, iconSymbol);

  return (
    <>
      {/* Hidden ringed-aToken icon generator (fun-routed rows only). Wrapped out
          of flow so it never participates as a flex/grid item in the host layout
          — it's a 0×0 element and would otherwise take a slot / introduce a gap. */}
      {generator && (
        <Box component="span" sx={{ position: 'absolute', width: 0, height: 0 }}>
          {generator}
        </Box>
      )}
      <Button
        variant="contained"
        {...buttonProps}
        onClick={() =>
          handleSupplyClick({
            underlyingAsset,
            name,
            symbol,
            aTokenBase64,
            supplyAPY,
            collateralEnabled,
          })
        }
      >
        {children ?? <Trans>Supply</Trans>}
      </Button>
    </>
  );
}

export default FunSupplyButton;
