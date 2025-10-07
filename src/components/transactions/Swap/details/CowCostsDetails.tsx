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
import { isCowProtocolRates, OrderType, SwapState } from '../types';

export const CowCostsDetails = ({ state }: { state: SwapState }) => {
  const [costBreakdownExpanded, setCostBreakdownExpanded] = useState(false);

  if (!state.swapRate || !isCowProtocolRates(state.swapRate)) return null;

  let networkFeeFormatted,
    networkFeeUsd,
    networkFeeToken,
    flashloanFeeFormatted,
    flashloanFeeUsd,
    flashloanFeeToken;
  if (state.side === 'sell') {
    networkFeeFormatted = normalize(
      state.swapRate.amountAndCosts.costs.networkFee.amountInBuyCurrency.toString(),
      state.destinationToken.decimals
    );
    networkFeeUsd = Number(networkFeeFormatted) * state.swapRate.destTokenPriceUsd;
    networkFeeToken = state.destinationToken;

    // If using flash-loan via CoW we need to account for the flash-loan fee
    flashloanFeeFormatted = normalize(
      calculateFlashLoanAmounts(state).flashLoanFeeAmount.toString(),
      state.sourceToken.decimals
    );
    flashloanFeeUsd = Number(flashloanFeeFormatted) * state.swapRate.srcTokenPriceUsd;
    flashloanFeeToken = state.sourceToken;
  } else {
    networkFeeFormatted = normalize(
      state.swapRate.amountAndCosts.costs.networkFee.amountInSellCurrency.toString(),
      state.sourceToken.decimals
    );
    networkFeeUsd = Number(networkFeeFormatted) * state.swapRate.srcTokenPriceUsd;
    networkFeeToken = state.sourceToken;
  }

  // Partner fee always in buy currency
  const partnerFeeFormatted = normalize(
    state.swapRate.amountAndCosts.costs.partnerFee.amount.toString(),
    state.destinationToken.decimals
  );
  const partnerFeeUsd = Number(partnerFeeFormatted) * state.swapRate.destTokenPriceUsd;
  const partnerFeeToken = state.destinationToken;

  const totalCostsInUsd = networkFeeUsd + partnerFeeUsd + (flashloanFeeUsd ?? 0); // + costs.slippageInUsd;

  return (
    <Accordion
      sx={{
        mb: 4,
        boxShadow: 'none',
        '&:before': { display: 'none' },
        '.MuiAccordionSummary-root': { minHeight: '24px', maxHeight: '24px' },
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
          padding: 0,
          minHeight: '24px',
          height: '24px',
          '.MuiAccordionSummary-content': { margin: 0 },
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
