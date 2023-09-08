import { valueToBigNumber } from '@aave/math-utils';
import { SwitchHorizontalIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, ButtonBase, IconButton, SvgIcon, Tooltip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

type SwitchRatesProps = {
  token1Symbol: string;
  token2Symbol: string;
  token1Price: string;
  token2Price: string;
  token1UsdPrice: string;
  token2UsdPrice: string;
};

export const SwitchRates = ({
  token1Symbol,
  token1Price,
  token1UsdPrice,
  token2Symbol,
  token2Price,
  token2UsdPrice,
}: SwitchRatesProps) => {

  const [isSwitched, setIsSwitched] = useState(false);


  const rate = useMemo(() => {
    const price1 = valueToBigNumber(token1Price);
    const price2 = valueToBigNumber(token2Price);
    return isSwitched ? price1.div(price2) : price2.div(price1);
  }, [isSwitched, token1Price, token2Price]);

  const priceImpact = useMemo(() => {
    const price1 = valueToBigNumber(token1UsdPrice);
    const price2 = valueToBigNumber(token2UsdPrice);
    return price2.minus(price1).div(price1);
  }, [token1UsdPrice, token2UsdPrice]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 6 }}>
      <FormattedNumber
        visibleDecimals={0}
        variant="main12"
        symbol={isSwitched ? token2Symbol : token1Symbol}
        symbolsVariant="secondary12"
        symbolsColor="text.secondary"
        value={'1'}
      />
      <ButtonBase onClick={() => setIsSwitched(isSwitched => !isSwitched)} disableTouchRipple sx={{ mx: 1 }}>
        <SvgIcon sx={{ fontSize: '12px' }}>
          <SwitchHorizontalIcon />
        </SvgIcon>
      </ButtonBase>
      <FormattedNumber
        variant="main12"
        symbol={isSwitched ? token1Symbol : token2Symbol}
        symbolsVariant="secondary12"
        symbolsColor="text.secondary"
        value={rate.toString()}
        visibleDecimals={3}
      />
      <DarkTooltip title={<Typography variant="caption"><Trans>Price impact</Trans></Typography>}>
        <Box sx={{ display: 'flex', cursor: 'pointer' }}>
          <Typography variant="caption">
            {"("}
          </Typography>
          <FormattedNumber variant="caption"
            value={priceImpact.toString()}
            percent
          />
          <Typography variant="caption">
            {")"}
          </Typography>
        </Box>
      </DarkTooltip>
    </Box>
  );
};
