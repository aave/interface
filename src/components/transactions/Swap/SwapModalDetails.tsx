import React from 'react';
import { ComputedReserveData } from '../../../hooks/app-data-provider/useAppDataProvider';
import { Typography, Box, SvgIcon, useTheme } from '@mui/material';
import { Trans } from '@lingui/macro';

import {
  DetailsHFLine,
  DetailsIncentivesLine,
  DetailsNumberLine,
} from 'src/components/transactions/FlowCommons/TxModalDetails';
import { Row } from 'src/components/primitives/Row';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ArrowNarrowRightIcon } from '@heroicons/react/outline';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

export type SupplyModalDetailsProps = {
  showHealthFactor: boolean;
  healthFactor: string;
  healthFactorAfterSwap: string;
  swapSource: ComputedReserveData;
  swapTarget: ComputedReserveData;
};

export const SwapModalDetails = ({
  showHealthFactor,
  healthFactor,
  healthFactorAfterSwap,
  swapSource,
  swapTarget,
}: SupplyModalDetailsProps) => {
  const { palette } = useTheme();

  const parseUsageString = (usage: boolean) => {
    if (usage) {
      return (
        <Typography variant="secondary14" color={palette.success.main}>
          <Trans>Yes</Trans>
        </Typography>
      );
    } else {
      return (
        <Typography variant="secondary14" color={palette.error.main}>
          <Trans>No</Trans>
        </Typography>
      );
    }
  };

  return (
    <>
      {healthFactorAfterSwap && (
        <DetailsHFLine
          healthFactor={healthFactor}
          futureHealthFactor={healthFactorAfterSwap}
          visibleHfChange={showHealthFactor}
        />
      )}
      <DetailsNumberLine
        description={<Trans>Supply apy</Trans>}
        value={swapSource.supplyAPY}
        futureValue={swapTarget.supplyAPY}
        percent
      />
      <Row caption={<Trans>Can be collateral</Trans>} captionVariant="description" mb={4}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {parseUsageString(swapSource.usageAsCollateralEnabled)}

          <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
            <ArrowNarrowRightIcon />
          </SvgIcon>

          {parseUsageString(swapTarget.usageAsCollateralEnabled)}
        </Box>
      </Row>
      <DetailsIncentivesLine
        incentives={swapSource.aIncentivesData}
        symbol={swapSource.symbol}
        futureIncentives={swapTarget.aIncentivesData}
        futureSymbol={swapTarget.symbol}
      />
      <DetailsNumberLine
        description={<Trans>Liquidation threshold</Trans>}
        value={swapSource.formattedReserveLiquidationThreshold}
        futureValue={swapTarget.formattedReserveLiquidationThreshold}
        percent
        visibleDecimals={0}
      />
      <Row
        caption={<Trans>Supply balance after swap</Trans>}
        captionVariant="description"
        mb={4}
        align="flex-start"
      >
        <Box sx={{ textAlign: 'right' }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: '8px' }}
          >
            <TokenIcon symbol={swapSource.iconSymbol} sx={{ mr: 2, ml: 4, fontSize: '16px' }} />
            <FormattedNumber value={1} variant="secondary14" compact />
            <Typography variant="secondary14">{swapSource.symbol}</Typography>
            <FormattedNumber
              value={1}
              variant="helperText"
              compact
              symbol="USD"
              symbolsColor="text.secondary"
              color="text.secondary"
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <TokenIcon symbol={swapTarget.iconSymbol} sx={{ mr: 2, ml: 4, fontSize: '16px' }} />
            <FormattedNumber value={1} variant="secondary14" compact />
            <Typography variant="secondary14">{swapTarget.symbol}</Typography>
            <FormattedNumber
              value={1}
              variant="helperText"
              compact
              symbol="USD"
              symbolsColor="text.secondary"
              color="text.secondary"
            />
          </Box>
        </Box>
      </Row>
    </>
  );
};
