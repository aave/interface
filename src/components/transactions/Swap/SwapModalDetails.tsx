import { valueToBigNumber } from '@aave/math-utils';
import { ArrowNarrowRightIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Skeleton, SvgIcon, Typography, useTheme } from '@mui/material';
import React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import {
  DetailsHFLine,
  DetailsIncentivesLine,
  DetailsNumberLine,
} from 'src/components/transactions/FlowCommons/TxModalDetails';

import { ComputedUserReserveData } from '../../../hooks/app-data-provider/useAppDataProvider';

export type SupplyModalDetailsProps = {
  showHealthFactor: boolean;
  healthFactor: string;
  healthFactorAfterSwap: string;
  swapSource: ComputedUserReserveData;
  swapTarget: ComputedUserReserveData;
  toAmount: string;
  fromAmount: string;
  loading: boolean;
};

export const SwapModalDetails = ({
  showHealthFactor,
  healthFactor,
  healthFactorAfterSwap,
  swapSource,
  swapTarget,
  toAmount,
  fromAmount,
  loading,
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
          loading={loading}
        />
      )}
      <DetailsNumberLine
        description={<Trans>Supply apy</Trans>}
        value={swapSource.reserve.supplyAPY}
        futureValue={swapTarget.reserve.supplyAPY}
        percent
        loading={loading}
      />
      <Row caption={<Trans>Can be collateral</Trans>} captionVariant="description" mb={4}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {loading ? (
            <Skeleton variant="rectangular" height={20} width={100} sx={{ borderRadius: '4px' }} />
          ) : (
            <>
              {parseUsageString(swapSource.reserve.usageAsCollateralEnabled)}

              <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
                <ArrowNarrowRightIcon />
              </SvgIcon>

              {parseUsageString(swapTarget.reserve.usageAsCollateralEnabled)}
            </>
          )}
        </Box>
      </Row>
      <DetailsIncentivesLine
        incentives={swapSource.reserve.aIncentivesData}
        symbol={swapSource.reserve.symbol}
        futureIncentives={swapTarget.reserve.aIncentivesData}
        futureSymbol={swapTarget.reserve.symbol}
        loading={loading}
      />
      <DetailsNumberLine
        description={<Trans>Liquidation threshold</Trans>}
        value={swapSource.reserve.formattedReserveLiquidationThreshold}
        futureValue={swapTarget.reserve.formattedReserveLiquidationThreshold}
        percent
        visibleDecimals={0}
        loading={loading}
      />

      <Row
        caption={<Trans>Supply balance after swap</Trans>}
        captionVariant="description"
        mb={4}
        align="flex-start"
      >
        <Box sx={{ textAlign: 'right' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={20}
                width={100}
                sx={{ borderRadius: '4px' }}
              />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TokenIcon
                  symbol={swapSource.reserve.iconSymbol}
                  sx={{ mr: 2, ml: 4, fontSize: '16px' }}
                />
                <FormattedNumber
                  value={sourceAmountAfterSwap.toString()}
                  variant="secondary14"
                  compact
                />
              </Box>
            )}
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={15}
                width={80}
                sx={{ borderRadius: '4px', marginTop: '4px' }}
              />
            ) : (
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
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
            mt={2}
          >
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={20}
                width={100}
                sx={{ borderRadius: '4px' }}
              />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TokenIcon
                  symbol={swapTarget.reserve.iconSymbol}
                  sx={{ mr: 2, ml: 4, fontSize: '16px' }}
                />
                <FormattedNumber
                  value={targetAmountAfterSwap.toString()}
                  variant="secondary14"
                  compact
                />
              </Box>
            )}
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={15}
                width={80}
                sx={{ borderRadius: '4px', marginTop: '4px' }}
              />
            ) : (
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
            )}
          </Box>
        </Box>
      </Row>
    </>
  );
};
