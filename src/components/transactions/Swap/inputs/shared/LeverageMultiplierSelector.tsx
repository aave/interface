import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { Dispatch } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

import { LIQUIDATION_SAFETY_THRESHOLD } from '../../constants/shared.constants';
import {
  addedCollateralUsdForLeverage,
  leverageAfterAdding,
  maxAddedCollateralUsdForHealthFactor,
  positionLeverage,
} from '../../helpers/shared/leverage.helpers';
import { ProtocolSwapState, SwapState } from '../../types';

const PRESET_MULTIPLIERS = [1.5, 2, 3];

/**
 * Picks the collateral amount from a target leverage instead of a token amount, which is how the
 * size of a leverage position is usually chosen. `Max` is the largest amount that still lands on
 * the safe health factor, so the safe factor is the only ceiling.
 */
export const LeverageMultiplierSelector = ({
  state,
  setState,
}: {
  state: ProtocolSwapState;
  setState: Dispatch<Partial<SwapState>>;
}) => {
  const { user } = useAppDataContext();

  const collateralUSD = user?.totalCollateralUSD ?? '0';
  const debtUSD = user?.totalBorrowsUSD ?? '0';
  const current = positionLeverage(collateralUSD, debtUSD);
  const sourceToken = state.sourceToken;
  const collateralPrice = sourceToken?.usdPrice;

  // Without equity or a price there is nothing to solve for.
  if (!user || !current || !sourceToken || !collateralPrice) return null;
  if (valueToBigNumber(collateralPrice).lte(0)) return null;

  const applyAddedUsd = (addedUSD: string) => {
    const amount = valueToBigNumber(addedUSD).div(valueToBigNumber(collateralPrice));
    setState({
      inputAmount: amount.toFixed(sourceToken.decimals, 1),
      inputAmountUSD: addedUSD,
      isMaxSelected: false,
      side: 'sell',
      quoteRefreshPaused: false,
    });
  };

  const maxAddedUSD = maxAddedCollateralUsdForHealthFactor({
    collateralUSD,
    debtUSD,
    currentLiquidationThreshold: user.currentLiquidationThreshold,
    collateralLiquidationThreshold:
      state.sourceReserve.reserve.formattedReserveLiquidationThreshold,
    targetHealthFactor: LIQUIDATION_SAFETY_THRESHOLD,
  });

  const projected = state.inputAmountUSD
    ? leverageAfterAdding({
        collateralUSD,
        debtUSD,
        addedCollateralUSD: state.inputAmountUSD,
        // Equal USD on both sides: the debt drawn is what buys the collateral.
        addedDebtUSD: state.inputAmountUSD,
      })
    : undefined;

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="description" color="text.secondary">
          <Trans>Leverage</Trans>
        </Typography>
        <Typography variant="secondary14">
          {(projected ?? current).toFixed(2)}
          {'×'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {PRESET_MULTIPLIERS.map((multiplier) => {
          const addedUSD = addedCollateralUsdForLeverage({
            collateralUSD,
            debtUSD,
            target: multiplier,
          });
          const overSafeLimit = !!addedUSD && !!maxAddedUSD && addedUSD.gt(maxAddedUSD);

          return (
            <Button
              key={multiplier}
              size="small"
              fullWidth
              variant="outlined"
              disabled={!addedUSD || overSafeLimit}
              onClick={() => addedUSD && applyAddedUsd(addedUSD.toString())}
              data-cy={`leverageMultiplier_${multiplier}`}
            >
              {multiplier}
              {'×'}
            </Button>
          );
        })}
        <Button
          size="small"
          fullWidth
          variant="outlined"
          disabled={!maxAddedUSD}
          onClick={() => maxAddedUSD && applyAddedUsd(maxAddedUSD.toString())}
          data-cy={`leverageMultiplier_max`}
        >
          <Trans>Max</Trans>
        </Button>
      </Box>
    </Box>
  );
};
