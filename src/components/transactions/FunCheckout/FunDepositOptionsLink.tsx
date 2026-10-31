import { Trans } from '@lingui/macro';
import { Box, ButtonBase, Typography } from '@mui/material';
import { ChevronRightIcon } from 'src/components/icons/ChevronRightIcon';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

import { isFunSupplyAsset } from './funSupplyAssets';
import { useFunSupplyATokenIcon } from './useFunSupplyATokenIcon';
import { useOpenFunSupply } from './useOpenFunSupply';

export type FunDepositOptionsLinkProps = {
  underlyingAsset: string;
  /** Patched display symbol of the underlying (drives the funkit checkout title). */
  symbol: string;
  /** Symbol used to generate the ringed aToken icon (can differ from `symbol`). */
  iconSymbol: string;
  /** Aave's `supplyAPY` — a 0–1 fraction. */
  supplyAPY: string | number;
  /** Whether this supply is/will be enabled as collateral for the user. */
  collateralEnabled: boolean;
  /** Blocks leaving the native modal, e.g. while its supply tx is in flight. */
  disabled?: boolean;
};

/**
 * "Other ways to deposit" entry point inside the native supply modal. Renders
 * only for the allowlisted fun assets; clicking it closes the native modal and
 * opens the funkit checkout, which offers swaps, cross-chain, card and exchange
 * deposits (same-token deposits are disabled there — see buildFunSupplyConfig).
 */
export function FunDepositOptionsLink({
  underlyingAsset,
  symbol,
  iconSymbol,
  supplyAPY,
  collateralEnabled,
  disabled,
}: FunDepositOptionsLinkProps) {
  const currentMarket = useRootStore((store) => store.currentMarket);
  const { close } = useModalContext();
  const openFunSupply = useOpenFunSupply();
  const { aTokenBase64, generator } = useFunSupplyATokenIcon(underlyingAsset, iconSymbol);

  if (!isFunSupplyAsset(currentMarket, underlyingAsset)) {
    return null;
  }

  const handleClick = () => {
    const opened = openFunSupply({
      underlyingAsset,
      symbol,
      aTokenBase64,
      supplyAPY,
      collateralEnabled,
    });
    if (opened) {
      close();
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 6 }}>
      {/* Hidden ringed-aToken icon generator; kept out of flow (0×0 element). */}
      {generator && (
        <Box component="span" sx={{ position: 'absolute', width: 0, height: 0 }}>
          {generator}
        </Box>
      )}
      <ButtonBase
        onClick={handleClick}
        disabled={disabled}
        data-cy="funDepositOptionsLink"
        sx={{
          gap: 1,
          color: 'fg-3',
          borderRadius: '4px',
          '&:hover': { color: 'fg-1' },
          '&.Mui-disabled': { opacity: 0.5 },
        }}
      >
        <Typography
          variant="description"
          component="span"
          sx={{
            color: 'inherit',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            textUnderlineOffset: '4px',
          }}
        >
          <Trans>or use a card, exchanges or swaps to deposit</Trans>
        </Typography>
        <ChevronRightIcon sx={{ fontSize: 16 }} />
      </ButtonBase>
    </Box>
  );
}
