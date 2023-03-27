import { valueToBigNumber } from '@aave/math-utils';
import { ArrowNarrowRightIcon, InformationCircleIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Skeleton, Stack, SvgIcon, Typography } from '@mui/material';
import React from 'react';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { IsolatedTooltip } from 'src/components/isolationMode/IsolatedTooltip';
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

export type SupplyModalDetailsProps = {
  showHealthFactor: boolean;
  healthFactor: string;
  healthFactorAfterSwap: string;
  swapSource: ComputedUserReserveData & { collateralType: CollateralType };
  swapTarget: ComputedUserReserveData & { collateralType: CollateralType };
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
        description={<Trans>Supply apy</Trans>}
        value={swapSource.reserve.supplyAPY}
        futureValue={swapTarget.reserve.supplyAPY}
        percent
        loading={loading}
      />
      <Row caption={<Trans>Collateral</Trans>} captionVariant="description" mb={4}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {loading ? (
            <Skeleton variant="rectangular" height={20} width={100} sx={{ borderRadius: '4px' }} />
          ) : (
            <>
              <CollateralState collateralType={swapSource.collateralType} />

              <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
                <ArrowNarrowRightIcon />
              </SvgIcon>

              <CollateralState collateralType={swapTarget.collateralType} />
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

const CollateralState = ({ collateralType }: { collateralType: CollateralType }) => {
  return (
    <Stack>
      {collateralType === CollateralType.UNAVAILABLE && (
        <>
          <ContentWithTooltip
            tooltipContent={<Trans>Collateral usage is limited because of Isolation mode.</Trans>}
          >
            <Stack direction="row" sx={{ alignItems: 'center' }}>
              <Trans>Unavailable</Trans>
              <SvgIcon
                sx={{
                  ml: '3px',
                  color: 'text.muted',
                  fontSize: '14px',
                }}
              >
                <InformationCircleIcon />
              </SvgIcon>
            </Stack>
          </ContentWithTooltip>
        </>
      )}
      {collateralType === CollateralType.ENABLED && (
        <Typography variant="description" color="success.main">
          <Trans>Enabled</Trans>
        </Typography>
      )}
      {(collateralType === CollateralType.ISOLATED_ENABLED ||
        collateralType === CollateralType.ISOLATED_DISABLED) && (
        <ContentWithTooltip tooltipContent={<IsolatedTooltip />}>
          <Stack direction="row" sx={{ alignItems: 'center' }}>
            <Typography color="warning.main">
              <Trans>In isolation</Trans>
            </Typography>
            <SvgIcon
              sx={{
                ml: '3px',
                color: 'text.muted',
                fontSize: '14px',
              }}
            >
              <InformationCircleIcon />
            </SvgIcon>
          </Stack>
        </ContentWithTooltip>
      )}
      {collateralType === CollateralType.DISABLED && (
        <Typography color="text.primary">
          <Trans>Disabled</Trans>
        </Typography>
      )}
    </Stack>
  );
};
