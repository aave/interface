import { valueToBigNumber } from '@aave/math-utils';
import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Skeleton, Stack, SvgIcon, Typography } from '@mui/material';
import React from 'react';
import { FixedAPYTooltip } from 'src/components/infoTooltips/FixedAPYTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import {
  // DetailsHFLine,
  DetailsIncentivesLine,
  DetailsNumberLine,
} from 'src/components/transactions/FlowCommons/TxModalDetails';

import { ComputedUserReserveData } from '../../../hooks/app-data-provider/useAppDataProvider';

export type DebtSwitchModalDetailsProps = {
  // healthFactor: string;
  // healthFactorAfterSwap: string;
  switchSource: ComputedUserReserveData;
  switchTarget: ComputedUserReserveData;
  toAmount: string;
  fromAmount: string;
  loading: boolean;
  sourceBalance: string;
  sourceBorrowAPY: string;
  targetBorrowAPY: string;
  showAPYTypeChange: boolean;
};

export const DebtSwitchModalDetails = ({
  // healthFactor,
  // healthFactorAfterSwap,
  switchSource,
  switchTarget,
  toAmount,
  fromAmount,
  loading,
  sourceBalance,
  sourceBorrowAPY,
  targetBorrowAPY,
  showAPYTypeChange,
}: DebtSwitchModalDetailsProps) => {
  const sourceAmountAfterSwap = valueToBigNumber(sourceBalance).minus(valueToBigNumber(fromAmount));

  const targetAmountAfterSwap = valueToBigNumber(switchTarget.variableBorrows).plus(
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
      {/* {healthFactorAfterSwap && (
        <DetailsHFLine
          healthFactor={healthFactor}
          futureHealthFactor={healthFactorAfterSwap}
          visibleHfChange={true}
          loading={loading}
        />
      )} */}
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
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {switchSource.reserve.symbol === 'GHO' ? (
                  <FixedAPYTooltip text={<Trans>Fixed</Trans>} typography="secondary14" />
                ) : (
                  <Typography variant="secondary14">
                    <Trans>Stable</Trans>
                  </Typography>
                )}
                <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
                  <ArrowNarrowRightIcon />
                </SvgIcon>
                {switchTarget.reserve.symbol === 'GHO' ? (
                  <FixedAPYTooltip text={<Trans>Fixed</Trans>} typography="secondary14" />
                ) : (
                  <Typography variant="secondary14">
                    <Trans>Variable</Trans>
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Row>
      )}
      <DetailsIncentivesLine
        incentives={switchSource.reserve.aIncentivesData}
        symbol={switchSource.reserve.symbol}
        futureIncentives={switchSource.reserve.aIncentivesData}
        futureSymbol={switchSource.reserve.symbol}
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
                    symbol={switchSource.reserve.iconSymbol}
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
                    .multipliedBy(valueToBigNumber(switchSource.reserve.priceInUSD))
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
                    symbol={switchTarget.reserve.iconSymbol}
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
                    .multipliedBy(valueToBigNumber(switchTarget.reserve.priceInUSD))
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
