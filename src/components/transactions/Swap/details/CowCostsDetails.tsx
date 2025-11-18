import { normalize, valueToBigNumber } from '@aave/math-utils';
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
import { isCowProtocolRates, OrderType, SwapState } from '../types';

export const CowCostsDetails = ({ state }: { state: SwapState }) => {
  const [costBreakdownExpanded, setCostBreakdownExpanded] = useState(false);

  if (!state.swapRate || !isCowProtocolRates(state.swapRate)) return null;

  // Prefer unified values exported on state; fall back to raw swapRate if missing
  const networkFeeFormatted = state.networkFeeAmountInSellFormatted || '0';

  const networkFeeUsd =
    Number(networkFeeFormatted) *
    (!state.isInvertedSwap ? state.swapRate.srcTokenPriceUsd : state.swapRate.destTokenPriceUsd);
  const networkFeeToken = !state.isInvertedSwap ? state.sourceToken : state.destinationToken;

  // If using flash-loan via CoW we need to account for the flash-loan fee
  const flashloanFeeFormatted = normalize(
    calculateFlashLoanAmounts(state).flashLoanFeeAmount.toString(),
    state.sellAmountToken?.decimals ?? 18
  );
  const flashLoanFeeTokenPriceUnitUsd = valueToBigNumber(state.sellAmountUSD ?? '0')
    .dividedBy(valueToBigNumber(state.sellAmountFormatted ?? '0'))
    .toNumber();
  const flashloanFeeUsd = Number(flashloanFeeFormatted) * flashLoanFeeTokenPriceUnitUsd;
  const flashloanFeeToken = state.sellAmountToken;

  if (!state.buyAmountToken || !state.sellAmountToken) return null;

  // Partner fee is applied to the surplus token:
  // - For sell orders: fee in buy token (destinationToken), deducted from buy amount
  // - For buy orders: fee in sell token (sourceToken), added to sell amount
  // For Debt and Repay with collateral, the swap is inverted to our UI
  const invertedSide = state.processedSide;
  let partnerFeeFormatted: string,
    partnerFeeUsd: number,
    partnerFeeToken: typeof state.buyAmountToken | typeof state.sellAmountToken;
  if (invertedSide === 'buy') {
    // Fee in destination token (buy token)
    partnerFeeFormatted = state.partnerFeeAmountFormatted ?? '0';
    const partnerFeeAmountPriceUnitUsd =
      state.sellAmountFormatted == '0'
        ? 0
        : valueToBigNumber(state.sellAmountUSD ?? '0')
            .dividedBy(valueToBigNumber(state.sellAmountFormatted ?? '0'))
            .toNumber();
    partnerFeeUsd = Number(partnerFeeFormatted) * partnerFeeAmountPriceUnitUsd;
    partnerFeeToken = state.sellAmountToken;
  } else {
    // Fee in source token (sell token)
    partnerFeeFormatted = state.partnerFeeAmountFormatted || '0';

    const partnerFeeAmountPriceUnitUsd =
      state.buyAmountFormatted == '0'
        ? 0
        : valueToBigNumber(state.buyAmountUSD ?? '0')
            .dividedBy(valueToBigNumber(state.buyAmountFormatted ?? '0'))
            .toNumber();

    partnerFeeUsd = Number(partnerFeeFormatted) * partnerFeeAmountPriceUnitUsd;
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
          maxHeight: '24px',
          height: '24px',
          '&.Mui-expanded': {
            minHeight: '24px',
            maxHeight: '24px',
            height: '24px',
          },
          '.MuiAccordionSummary-content': {
            margin: 0,
            alignItems: !costBreakdownExpanded ? 'center' : undefined,
            display: !costBreakdownExpanded ? 'flex' : undefined,
          },
          '& .MuiAccordionSummary-content.Mui-expanded': {
            margin: 0,
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
