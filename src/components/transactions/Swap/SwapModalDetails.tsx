import { valueToBigNumber } from '@aave/math-utils';
import { ArrowNarrowRightIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Skeleton, Stack, SvgIcon, Typography } from '@mui/material';
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
import { getDebtCeilingData } from 'src/hooks/useAssetCaps';

import {
  ComputedUserReserveData,
  useAppDataContext,
} from '../../../hooks/app-data-provider/useAppDataProvider';
import { getAssetCollateralType } from '../utils';

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
  const { user } = useAppDataContext();

  const { debtCeilingReached: sourceDebtCeiling } = getDebtCeilingData(swapTarget.reserve);
  const swapSourceCollateralType = getAssetCollateralType(
    swapSource,
    swapSource.reserve,
    user.totalCollateralUSD,
    user.isInIsolationMode,
    sourceDebtCeiling
  );

  const { debtCeilingReached: targetDebtCeiling } = getDebtCeilingData(swapTarget.reserve);
  const swapTargetCollateralType = getAssetCollateralType(
    swapTarget,
    swapTarget.reserve,
    user.totalCollateralUSD,
    user.isInIsolationMode,
    targetDebtCeiling
  );

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

  const CanBeCollateral = ({ collateralType }: { collateralType: CollateralType }) => {
    return (
      <Stack>
        {collateralType === CollateralType.UNAVAILABLE && (
          <Typography variant="description" color="error.main">
            <Trans>Unavailable</Trans>
          </Typography>
        )}
        {collateralType === CollateralType.ENABLED && (
          <Typography variant="description" color="success.main">
            <Trans>Yes</Trans>
          </Typography>
        )}
        {collateralType === CollateralType.ISOLATED_ENABLED && (
          <Typography variant="description" color="warning.main">
            <Trans>In isolation</Trans>
          </Typography>
        )}
        {collateralType === CollateralType.DISABLED && (
          <Typography variant="description" color="grey">
            <Trans>Disabled</Trans>
          </Typography>
        )}
        {collateralType === CollateralType.ISOLATED_DISABLED && (
          <Typography variant="description" color="grey">
            <Trans>Disabled</Trans>
          </Typography>
        )}
      </Stack>
    );
  };

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
              <CanBeCollateral collateralType={swapSourceCollateralType} />

              <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
                <ArrowNarrowRightIcon />
              </SvgIcon>

              <CanBeCollateral collateralType={swapTargetCollateralType} />
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
