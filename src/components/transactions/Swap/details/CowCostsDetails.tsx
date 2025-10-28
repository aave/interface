import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box } from '@mui/material';
import { useState } from 'react';
import { EstimatedCostsForLimitSwapTooltip } from 'src/components/infoTooltips/EstimatedCostsForLimitSwap';
import { ExecutionFeeTooltip } from 'src/components/infoTooltips/ExecutionFeeTooltip';
import { NetworkCostTooltip } from 'src/components/infoTooltips/NetworkCostTooltip';
import { SwapFeeTooltip } from 'src/components/infoTooltips/SwapFeeTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { ExternalTokenIcon } from 'src/components/primitives/TokenIcon';

import { calculateFlashLoanAmounts } from '../helpers/cow/adapters.helpers';
import { swapTypesThatRequiresInvertedQuote } from '../hooks/useSwapQuote';
import { isCowProtocolRates, OrderType, SwapState } from '../types';

export const CowCostsDetails = ({ state }: { state: SwapState }) => {
  const [costBreakdownExpanded, setCostBreakdownExpanded] = useState(false);

  if (!state.swapRate || !isCowProtocolRates(state.swapRate)) return null;

  let networkFeeFormatted;
  if (!state.isInvertedSwap) {
    networkFeeFormatted = normalize(
      state.swapRate.amountAndCosts.costs.networkFee.amountInBuyCurrency.toString(),
      state.swapRate.destDecimals
    );
  } else {
    networkFeeFormatted = normalize(
      state.swapRate.amountAndCosts.costs.networkFee.amountInBuyCurrency.toString(),
      state.swapRate.srcDecimals
    );
  }

  const networkFeeUsd = Number(networkFeeFormatted) * state.swapRate.destTokenPriceUsd;
  const networkFeeToken = state.destinationToken;
  // If using flash-loan via CoW we need to account for the flash-loan fee
  const flashloanFeeFormatted = normalize(
    calculateFlashLoanAmounts(state).flashLoanFeeAmount.toString(),
    state.sourceToken.decimals
  );
  const flashloanFeeUsd = Number(flashloanFeeFormatted) * state.swapRate.srcTokenPriceUsd;
  const flashloanFeeToken = state.sourceToken;

  if (!state.buyAmountToken || !state.sellAmountToken) return null;

  // Partner fee is applied to the surplus token:
  // - For sell orders: fee in buy token (destinationToken), deducted from buy amount
  // - For buy orders: fee in sell token (sourceToken), added to sell amount
  // For Debt and Repay with collateral, the swap is inverted to our UI
  const invertedSide = swapTypesThatRequiresInvertedQuote.includes(state.swapType)
    ? state.side === 'sell'
      ? 'buy'
      : 'sell'
    : state.side;
  let partnerFeeFormatted: string,
    partnerFeeUsd: number,
    partnerFeeToken: typeof state.sourceToken | typeof state.destinationToken;
  if (invertedSide === 'buy') {
    // Fee in destination token (buy token)
    partnerFeeFormatted = normalize(
      state.swapRate.amountAndCosts.costs.partnerFee.amount.toString(),
      state.buyAmountToken?.decimals ?? 18
    );
    partnerFeeUsd = Number(partnerFeeFormatted) * state.swapRate.destTokenPriceUsd;
    partnerFeeToken = state.destinationToken;
  } else {
    // Fee in source token (sell token)
    partnerFeeFormatted = normalize(
      state.swapRate.amountAndCosts.costs.partnerFee.amount.toString(),
      state.buyAmountToken?.decimals ?? 18
    );

    partnerFeeUsd = Number(partnerFeeFormatted) * state.swapRate.srcTokenPriceUsd;
    partnerFeeToken = state.buyAmountToken;
  }

  const totalCostsInUsd = networkFeeUsd + partnerFeeUsd + (flashloanFeeUsd ?? 0); // + costs.slippageInUsd;

  return (
    <Accordion
      sx={{
        mb: 4,
        boxShadow: 'none',
        '&:before': { display: 'none' },
        '.MuiAccordionSummary-root': { minHeight: '24px', maxHeight: '24px', margin: 0 },
        backgroundColor: 'transparent',
        mt: '0',
      }}
      onChange={(_, expanded) => {
        setCostBreakdownExpanded(expanded);
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          margin: 0,
          padding: 0,
          minHeight: '24px',
          height: '24px',
          '.MuiAccordionSummary-content': {
            margin: 0,
            alignItems: !costBreakdownExpanded ? 'center' : undefined,
            display: !costBreakdownExpanded ? 'flex' : undefined,
          },
        }}
      >
        <Row
          caption={
            state.orderType === OrderType.LIMIT ? (
              <EstimatedCostsForLimitSwapTooltip />
            ) : (
              <Trans>Costs & Fees</Trans>
            )
          }
          captionVariant="description"
          align="flex-start"
          width="100%"
          minHeight="24px"
          maxHeight="24px"
          sx={{
            margin: 0,
            display: 'flex',
            alignItems: !costBreakdownExpanded ? 'center' : undefined, // center only if not expanded
          }}
        >
          {!costBreakdownExpanded && (
            <FormattedNumber
              sx={{ mt: 0.5 }}
              compact={false}
              symbol="usd"
              symbolsVariant="caption"
              roundDown={false}
              variant="caption"
              visibleDecimals={2}
              value={totalCostsInUsd}
            />
          )}
        </Row>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: 0 }}>
        <Row
          mx={2}
          mb={2}
          mt={2}
          caption={<NetworkCostTooltip />}
          captionVariant="caption"
          align="flex-start"
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ExternalTokenIcon
                symbol={networkFeeToken.symbol}
                logoURI={networkFeeToken.logoURI}
                height="16px"
                width="16px"
                sx={{ mr: 2, ml: 4, fontSize: '16px' }}
              />
              <FormattedNumber value={networkFeeFormatted} variant="secondary12" compact />
            </Box>
            <FormattedNumber
              value={networkFeeUsd}
              variant="helperText"
              compact
              symbol="USD"
              symbolsColor="text.secondary"
              color="text.secondary"
            />
          </Box>
        </Row>
        {!!(flashloanFeeFormatted && flashloanFeeToken && flashloanFeeUsd) && (
          <Row
            mx={2}
            mb={2}
            mt={2}
            caption={<ExecutionFeeTooltip />}
            captionVariant="caption"
            align="flex-start"
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ExternalTokenIcon
                  symbol={flashloanFeeToken.symbol}
                  logoURI={flashloanFeeToken.logoURI}
                  height="16px"
                  width="16px"
                  sx={{ mr: 2, ml: 4, fontSize: '16px' }}
                />
                <FormattedNumber value={flashloanFeeFormatted} variant="secondary12" compact />
              </Box>
              <FormattedNumber
                value={flashloanFeeUsd}
                variant="helperText"
                compact
                symbol="USD"
                symbolsColor="text.secondary"
                color="text.secondary"
              />
            </Box>
          </Row>
        )}
        <Row mx={2} mb={2} caption={<SwapFeeTooltip />} captionVariant="caption" align="flex-start">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ExternalTokenIcon
                symbol={partnerFeeToken.symbol}
                logoURI={partnerFeeToken.logoURI}
                height="16px"
                width="16px"
                sx={{ mr: 2, ml: 4, fontSize: '16px' }}
              />
              <FormattedNumber value={partnerFeeFormatted} variant="secondary12" compact />
            </Box>
            <FormattedNumber
              value={partnerFeeUsd}
              variant="helperText"
              compact
              symbol="USD"
              symbolsColor="text.secondary"
              color="text.secondary"
            />
          </Box>
        </Row>
      </AccordionDetails>
    </Accordion>
  );
};
