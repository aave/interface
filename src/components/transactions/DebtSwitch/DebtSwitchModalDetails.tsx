import { InterestRate } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { ArrowSmRightIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Skeleton, SvgIcon, Typography } from '@mui/material';
import React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import {
  DetailsHFLine,
  DetailsIncentivesLine,
  DetailsNumberLine,
} from 'src/components/transactions/FlowCommons/TxModalDetails';
import { CollateralType } from 'src/helpers/types';

import { ComputedUserReserveData } from '../../../hooks/app-data-provider/useAppDataProvider';

export type DebtSwitchModalDetailsProps = {
  showHealthFactor: boolean;
  healthFactor: string;
  healthFactorAfterSwap: string;
  swapSource: ComputedUserReserveData & { collateralType: CollateralType };
  swapTarget: ComputedUserReserveData & { collateralType: CollateralType };
  toAmount: string;
  fromAmount: string;
  loading: boolean;
  sourceRateMode: InterestRate;
};

export const DebtSwitchModalDetails = ({
  showHealthFactor,
  healthFactor,
  healthFactorAfterSwap,
  swapSource,
  swapTarget,
  toAmount,
  fromAmount,
  loading,
  sourceRateMode,
}: DebtSwitchModalDetailsProps) => {
  const sourceAmountAfterSwap = valueToBigNumber(swapSource.underlyingBalance).minus(
    valueToBigNumber(fromAmount)
  );

  const targetAmountAfterSwap = valueToBigNumber(swapTarget.underlyingBalance).plus(
    valueToBigNumber(toAmount)
  );

  const skeleton: JSX.Element = (
    <>
      <Skeleton variant="rectangular" height={20} width={100} sx={{ borderRadius: '4px' }} />
      <Skeleton
        variant="rectangular"
        height={15}
        width={80}
        sx={{ borderRadius: '4px', marginTop: '4px' }}
      />
    </>
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
        description={<Trans>Loan to value</Trans>}
        value={swapSource.reserve.variableBorrowAPY}
        futureValue={swapTarget.reserve.variableBorrowAPY}
        percent
        loading={loading}
        valueSubHeader={
          <Typography variant="helperText" color="text.secondary">
            <Trans>Liquidation threshold TODO</Trans>
          </Typography>
        }
      />
      <DetailsNumberLine
        description={
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography>
              <Trans>Borrow apy</Trans>
            </Typography>
            <Typography variant="helperText" color="text.secondary">
              <Trans>APY type</Trans>
            </Typography>
          </Box>
        }
        value={
          sourceRateMode === InterestRate.Variable
            ? swapSource.reserve.variableBorrowAPY
            : swapSource.stableBorrowAPY
        }
        futureValue={swapTarget.reserve.variableBorrowAPY}
        percent
        loading={loading}
        valueSubHeader={
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="helperText" color="text.secondary">
              Stable
            </Typography>
            <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
              <ArrowSmRightIcon />
            </SvgIcon>
            <Typography variant="helperText" color="text.secondary">
              Variable
            </Typography>
          </Box>
        }
      />
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
        caption={<Trans>Borrow balance after switch</Trans>}
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
              skeleton
            ) : (
              <>
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
              </>
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
              skeleton
            ) : (
              <>
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
              </>
            )}
          </Box>
        </Box>
      </Row>
    </>
  );
};
