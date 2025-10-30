import { valueToBigNumber } from '@aave/math-utils';
import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Skeleton, SvgIcon, Typography } from '@mui/material';
import React from 'react';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import {
  DetailsIncentivesLine,
  TxModalDetails,
} from 'src/components/transactions/FlowCommons/TxModalDetails';

import { ProtocolSwapParams, ProtocolSwapState, SwapProvider } from '../types';
import { CowCostsDetails } from './CowCostsDetails';

export const DebtSwapDetails = ({
  state,
}: {
  params: ProtocolSwapParams;
  state: ProtocolSwapState;
}) => {
  const sourceAmountAfterSwap = valueToBigNumber(state.sourceReserve.variableBorrows).minus(
    valueToBigNumber(state.buyAmountFormatted ?? '0')
  );
  const targetAmountAfterSwap = valueToBigNumber(state.destinationReserve.variableBorrows).plus(
    valueToBigNumber(state.sellAmountFormatted ?? '0')
  );

  const sourceAmountAfterSwapUSD = sourceAmountAfterSwap.multipliedBy(
    valueToBigNumber(state.sourceReserve.reserve.priceInUSD)
  );
  const targetAmountAfterSwapUSD = targetAmountAfterSwap.multipliedBy(
    valueToBigNumber(state.destinationReserve.reserve.priceInUSD)
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
    <TxModalDetails gasLimit={state.gasLimit} showGasStation={state.showGasStation}>
      {state.provider === SwapProvider.COW_PROTOCOL && <CowCostsDetails state={state} />}

      <Row caption={<Trans>Borrow apy</Trans>} captionVariant="description" mb={4}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {state.ratesLoading ? (
            <Skeleton variant="rectangular" height={20} width={100} sx={{ borderRadius: '4px' }} />
          ) : (
            <>
              <FormattedNumber
                value={state.sourceReserve.reserve.variableBorrowAPY}
                variant="secondary14"
                percent
              />
              {ArrowRightIcon}
              <FormattedNumber
                value={state.destinationReserve.reserve.variableBorrowAPY}
                variant="secondary14"
                percent
              />
            </>
          )}
        </Box>
      </Row>

      <DetailsIncentivesLine
        incentives={state.sourceReserve.reserve.aIncentivesData}
        symbol={state.sourceReserve.reserve.symbol}
        futureIncentives={state.destinationReserve.reserve.aIncentivesData}
        futureSymbol={state.destinationReserve.reserve.symbol}
        loading={state.ratesLoading}
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
            {state.ratesLoading ? (
              skeleton
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TokenIcon
                    symbol={state.sourceReserve.reserve.iconSymbol}
                    sx={{ mr: 2, ml: 4, fontSize: '16px' }}
                  />
                  <DarkTooltip
                    title={
                      <Typography variant="secondary14" color="common.white">
                        {sourceAmountAfterSwap.toString()} {state.sourceReserve.reserve.symbol}
                      </Typography>
                    }
                    arrow
                    placement="top"
                    enterTouchDelay={100}
                    leaveTouchDelay={500}
                  >
                    <Box>
                      <FormattedNumber
                        value={sourceAmountAfterSwap.toString()}
                        variant="secondary14"
                        compact
                      />
                    </Box>
                  </DarkTooltip>
                </Box>
                <FormattedNumber
                  value={sourceAmountAfterSwapUSD.toString()}
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
            {state.ratesLoading ? (
              skeleton
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TokenIcon
                    symbol={state.destinationReserve.reserve.iconSymbol}
                    sx={{ mr: 2, ml: 4, fontSize: '16px' }}
                  />
                  <DarkTooltip
                    title={
                      <Typography variant="secondary14" color="common.white">
                        {targetAmountAfterSwap.toString()} {state.destinationReserve.reserve.symbol}
                      </Typography>
                    }
                    arrow
                    placement="top"
                    enterTouchDelay={100}
                    leaveTouchDelay={500}
                  >
                    <Box>
                      <FormattedNumber
                        value={targetAmountAfterSwap.toString()}
                        variant="secondary14"
                        compact
                      />
                    </Box>
                  </DarkTooltip>
                </Box>
                <FormattedNumber
                  value={targetAmountAfterSwapUSD.toString()}
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
    </TxModalDetails>
  );
};

const ArrowRightIcon = (
  <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
    <ArrowNarrowRightIcon />
  </SvgIcon>
);
