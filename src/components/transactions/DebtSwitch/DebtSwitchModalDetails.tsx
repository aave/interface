import { valueToBigNumber } from '@aave/math-utils';
import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Skeleton, Stack, SvgIcon, Typography } from '@mui/material';
import React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import {
  DetailsHFLine,
  DetailsIncentivesLine,
  DetailsNumberLine,
} from 'src/components/transactions/FlowCommons/TxModalDetails';

import { ComputedUserReserveData } from '../../../hooks/app-data-provider/useAppDataProvider';

export type DebtSwitchModalDetailsProps = {
  healthFactor: string;
  healthFactorAfterSwap: string;
  swapSource: ComputedUserReserveData;
  swapTarget: ComputedUserReserveData;
  toAmount: string;
  fromAmount: string;
  loading: boolean;
  sourceBalance: string;
  sourceBorrowAPY: string;
  targetBorrowAPY: string;
  showAPYTypeChange: boolean;
};

export const DebtSwitchModalDetails = ({
  healthFactor,
  healthFactorAfterSwap,
  swapSource,
  swapTarget,
  toAmount,
  fromAmount,
  loading,
  sourceBalance,
  sourceBorrowAPY,
  targetBorrowAPY,
  showAPYTypeChange,
}: DebtSwitchModalDetailsProps) => {
  const sourceAmountAfterSwap = valueToBigNumber(sourceBalance).minus(valueToBigNumber(fromAmount));

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
          visibleHfChange={true}
          loading={loading}
        />
      )}
      <DetailsNumberLine
        description={<Trans>Borrow apy</Trans>}
        value={sourceBorrowAPY}
        futureValue={targetBorrowAPY}
        percent
        loading={loading}
      />
      {showAPYTypeChange && (
        <Row
          caption={
            <Stack direction="row">
              <Trans>APY type</Trans>
              <TextWithTooltip>
                <Trans>
                  You can only switch to tokens with variable APY types. After this transaction, you
                  may change the variable rate to a stable one if available.
                </Trans>
              </TextWithTooltip>
            </Stack>
          }
          captionVariant="description"
          mb={4}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
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
              <Typography variant="secondary14">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Trans>Stable</Trans>
                  <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
                    <ArrowNarrowRightIcon />
                  </SvgIcon>
                  <Trans>Variable</Trans>
                </Box>
              </Typography>
            )}
          </Box>
        </Row>
      )}
      <DetailsIncentivesLine
        incentives={swapSource.reserve.aIncentivesData}
        symbol={swapSource.reserve.symbol}
        futureIncentives={swapTarget.reserve.aIncentivesData}
        futureSymbol={swapTarget.reserve.symbol}
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
