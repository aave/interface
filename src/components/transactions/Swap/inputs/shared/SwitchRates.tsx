import { normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { SwitchHorizontalIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, ButtonBase, SvgIcon, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

import { SwapQuoteType } from '../../types';

type SwitchRatesProps = {
  rates: SwapQuoteType;
  srcSymbol: string;
  destSymbol: string;
  showPriceImpact?: boolean;
};

export const SwitchRates = ({
  rates,
  srcSymbol,
  destSymbol,
  showPriceImpact = true,
}: SwitchRatesProps) => {
  const [isSwitched, setIsSwitched] = useState(false);

  // Reset switch state when rates change
  useEffect(() => {
    setIsSwitched(false);
  }, [rates.srcSpotAmount, rates.destSpotAmount, srcSymbol, destSymbol]);

  const rate = useMemo(() => {
    const amount1 = normalizeBN(rates.srcSpotAmount, rates.srcDecimals);
    const amount2 = normalizeBN(rates.destSpotAmount, rates.destDecimals);
    return isSwitched ? amount1.div(amount2) : amount2.div(amount1);
  }, [
    isSwitched,
    rates.srcSpotAmount,
    rates.srcDecimals,
    rates.destSpotAmount,
    rates.destDecimals,
  ]);

  const priceImpact = useMemo(() => {
    const price1 = valueToBigNumber(rates.srcSpotUSD);
    const price2 = valueToBigNumber(rates.destSpotUSD);
    return price2.minus(price1).div(price1);
  }, [rates.srcSpotUSD, rates.destSpotUSD]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 6 }}>
      <FormattedNumber
        visibleDecimals={0}
        variant="main12"
        symbol={isSwitched ? destSymbol : srcSymbol}
        symbolsVariant="secondary12"
        symbolsColor="text.secondary"
        value={'1'}
      />
      <ButtonBase
        onClick={() => setIsSwitched((isSwitched) => !isSwitched)}
        disableTouchRipple
        sx={{ mx: 1 }}
      >
        <SvgIcon sx={{ fontSize: '12px' }}>
          <SwitchHorizontalIcon />
        </SvgIcon>
      </ButtonBase>
      <FormattedNumber
        variant="main12"
        symbol={isSwitched ? srcSymbol : destSymbol}
        symbolsVariant="secondary12"
        symbolsColor="text.secondary"
        value={rate.toString()}
        visibleDecimals={3}
      />
      {showPriceImpact && (
        <DarkTooltip
          title={
            <Typography variant="caption">
              <Trans>Price impact</Trans>
            </Typography>
          }
        >
          <Box sx={{ display: 'flex', cursor: 'pointer' }}>
            <Typography variant="caption">{'('}</Typography>
            <FormattedNumber variant="caption" value={priceImpact.toString()} percent />
            <Typography variant="caption">{')'}</Typography>
          </Box>
        </DarkTooltip>
      )}
    </Box>
  );
};
