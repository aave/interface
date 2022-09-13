import React from 'react';
import { ComputedUserReserveData } from '../../../hooks/app-data-provider/useAppDataProvider';
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
import { valueToBigNumber } from '@aave/math-utils';

export type SupplyModalDetailsProps = {
  showHealthFactor: boolean;
  healthFactor: string;
  healthFactorAfterSwap: string;
  swapSource: ComputedUserReserveData;
  swapTarget: ComputedUserReserveData;
  toAmount: string;
  fromAmount: string;
};

export const SwapModalDetails = ({
  showHealthFactor,
  healthFactor,
  healthFactorAfterSwap,
  swapSource,
  swapTarget,
  toAmount,
  fromAmount,
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

  const sourceAmountAfterSwap = valueToBigNumber(swapSource.underlyingBalance).minus(
    valueToBigNumber(fromAmount)
  );

  const targetAmountAfterSwap = valueToBigNumber(swapTarget.underlyingBalance).plus(
    valueToBigNumber(toAmount)
  );

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
        value={swapSource.reserve.supplyAPY}
        futureValue={swapTarget.reserve.supplyAPY}
        percent
      />
      <Row caption={<Trans>Can be collateral</Trans>} captionVariant="description" mb={4}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {parseUsageString(swapSource.reserve.usageAsCollateralEnabled)}

          <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
            <ArrowNarrowRightIcon />
          </SvgIcon>

          {parseUsageString(swapTarget.reserve.usageAsCollateralEnabled)}
        </Box>
      </Row>
      <DetailsIncentivesLine
        incentives={swapSource.reserve.aIncentivesData}
        symbol={swapSource.reserve.symbol}
        futureIncentives={swapTarget.reserve.aIncentivesData}
        futureSymbol={swapTarget.reserve.symbol}
      />
      <DetailsNumberLine
        description={<Trans>Liquidation threshold</Trans>}
        value={swapSource.reserve.formattedReserveLiquidationThreshold}
        futureValue={swapTarget.reserve.formattedReserveLiquidationThreshold}
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <TokenIcon
              symbol={swapSource.reserve.iconSymbol}
              sx={{ mr: 2, ml: 4, fontSize: '16px' }}
            />
            <FormattedNumber
              value={sourceAmountAfterSwap.toString()}
              variant="secondary14"
              compact
            />
            <Typography variant="secondary14" ml={1}>
              {swapSource.reserve.symbol}
            </Typography>
          </Box>

          <FormattedNumber
            value={sourceAmountAfterSwap
              .multipliedBy(valueToBigNumber(swapSource.reserve.priceInUSD))
              .toString()}
            variant="helperText"
            compact
            symbol="USD"
            symbolsColor="text.secondary"
            color="text.secondary"
          />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }} mt={2}>
            <TokenIcon
              symbol={swapTarget.reserve.iconSymbol}
              sx={{ mr: 2, ml: 4, fontSize: '16px' }}
            />
            <FormattedNumber
              value={targetAmountAfterSwap.toString()}
              variant="secondary14"
              compact
            />
            <Typography variant="secondary14" ml={1}>
              {swapTarget.reserve.symbol}
            </Typography>
          </Box>

          <FormattedNumber
            value={targetAmountAfterSwap
              .multipliedBy(valueToBigNumber(swapTarget.reserve.priceInUSD))
              .toString()}
            variant="helperText"
            compact
            symbol="USD"
            symbolsColor="text.secondary"
            color="text.secondary"
          />
        </Box>
      </Row>
    </>
  );
};
