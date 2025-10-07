import { normalize, normalizeBN } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { useState } from 'react';
import { NetworkCostTooltip } from 'src/components/infoTooltips/NetworkCostTooltip';
import { SwapFeeTooltip } from 'src/components/infoTooltips/SwapFeeTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { ExternalTokenIcon } from 'src/components/primitives/TokenIcon';

import { TxModalDetails } from '../../FlowCommons/TxModalDetails';
import { SwappableToken, SwapParams, SwapProvider, SwapQuoteType, SwapState } from '../types';

export const SwapDetails = ({ params, state }: { params: SwapParams; state: SwapState }) => {
  if (!state.swapRate || !state.minimumReceived || !state.minimumReceivedUSD) return null;

  return (
    <TxModalDetails
      gasLimit={state.gasLimit}
      chainId={state.chainId}
      showGasStation={state.showGasStation}
    >
      <SwapModalTxDetails
        switchRates={state.swapRate}
        safeSlippage={state.safeSlippage}
        customReceivedTitle={params.customReceivedTitle}
        selectedInputToken={state.sourceToken}
        selectedOutputToken={state.destinationToken}
        minimumReceived={state.minimumReceived}
        minimumReceivedUSD={state.minimumReceivedUSD}
      />
    </TxModalDetails>
  );
};

export const SwapModalTxDetails = ({
  switchRates,
  selectedOutputToken,
  safeSlippage,
  customReceivedTitle,
  selectedInputToken,
  minimumReceived,
  minimumReceivedUSD,
}: {
  switchRates: SwapQuoteType;
  safeSlippage: number;
  customReceivedTitle?: React.ReactNode;
  selectedInputToken: SwappableToken;
  selectedOutputToken: SwappableToken;
  minimumReceived: string;
  minimumReceivedUSD: string;
}) => {
  return switchRates.provider === SwapProvider.COW_PROTOCOL ? (
    <IntentTxDetails
      selectedInputToken={selectedInputToken}
      selectedOutputToken={selectedOutputToken}
      safeSlippage={safeSlippage}
      customReceivedTitle={customReceivedTitle}
      networkFee={switchRates.amountAndCosts.costs.networkFee.amountInBuyCurrency.toString()}
      partnerFee={switchRates.amountAndCosts.costs.partnerFee.amount.toString()}
      inputTokenPriceUsd={switchRates.srcTokenPriceUsd}
      outputTokenPriceUsd={switchRates.destTokenPriceUsd}
      inputAmount={switchRates.srcSpotAmount}
      minimumReceived={minimumReceived}
      minimumReceivedUSD={minimumReceivedUSD}
    />
  ) : (
    <MarketOrderTxDetails
      switchRates={switchRates}
      selectedOutputToken={selectedOutputToken}
      safeSlippage={safeSlippage}
      customReceivedTitle={customReceivedTitle}
      minimumReceived={minimumReceived}
      minimumReceivedUSD={minimumReceivedUSD}
    />
  );
};

export const IntentTxDetails = ({
  selectedOutputToken,
  selectedInputToken,
  customReceivedTitle,
  networkFee,
  partnerFee,
  outputTokenPriceUsd,
  inputTokenPriceUsd,
  inputAmount,
  minimumReceived,
  minimumReceivedUSD,
}: {
  selectedOutputToken: SwappableToken;
  selectedInputToken: SwappableToken;
  safeSlippage: number;
  customReceivedTitle?: React.ReactNode;
  networkFee: string;
  partnerFee: string;
  outputTokenPriceUsd: number;
  inputTokenPriceUsd: number;
  inputAmount: string;
  minimumReceived: string;
  minimumReceivedUSD: string;
}) => {
  const [costBreakdownExpanded, setCostBreakdownExpanded] = useState(false);

  const networkFeeFormatted = normalize(networkFee, selectedOutputToken.decimals);
  const networkFeeUsd = Number(networkFeeFormatted) * outputTokenPriceUsd;

  const partnerFeeFormatted = normalize(partnerFee, selectedOutputToken.decimals);
  const partnerFeeUsd = Number(partnerFeeFormatted) * outputTokenPriceUsd;

  const totalCostsInUsd = networkFeeUsd + partnerFeeUsd; // + costs.slippageInUsd;

  const srcUsd = normalizeBN(inputAmount, selectedInputToken.decimals)
    .multipliedBy(inputTokenPriceUsd)
    .toNumber();

  const receivingInUsd = Number(minimumReceived);
  const sendingInUsd = srcUsd;

  const priceImpact = (1 - receivingInUsd / sendingInUsd) * 100;

  return (
    <>
      <Accordion
        sx={{
          mb: 4,
          boxShadow: 'none',
          '&:before': { display: 'none' },
          '.MuiAccordionSummary-root': { minHeight: '24px', maxHeight: '24px' },
          backgroundColor: 'transparent',
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
            caption={<Trans>{`Costs & Fees`}</Trans>}
            captionVariant="description"
            align="flex-start"
            width="100%"
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
                  symbol={selectedOutputToken.symbol}
                  logoURI={selectedOutputToken.logoURI}
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
          <Row
            mx={2}
            mb={2}
            caption={<SwapFeeTooltip />}
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
                  symbol={selectedOutputToken.symbol}
                  logoURI={selectedOutputToken.logoURI}
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

      <Row
        mb={4}
        caption={
          customReceivedTitle || <Trans>{`Minimum ${selectedOutputToken.symbol} received`}</Trans>
        }
        captionVariant="description"
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
              symbol={selectedOutputToken.symbol}
              logoURI={selectedOutputToken.logoURI}
              height="16px"
              width="16px"
              sx={{ mr: 2, ml: 4, fontSize: '16px' }}
            />
            <FormattedNumber
              value={minimumReceived}
              variant="secondary14"
              compact
              roundDown={true}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormattedNumber
              value={Number(minimumReceivedUSD)}
              variant="helperText"
              compact
              symbol="USD"
              symbolsColor="text.secondary"
              color="text.secondary"
              roundDown={true}
            />
            {priceImpact && priceImpact > 0 && priceImpact < 100 && (
              <Typography
                variant="helperText"
                style={{ marginLeft: 4 }}
                color={priceImpact > 10 ? 'error' : priceImpact > 5 ? 'warning' : 'text.secondary'}
              >
                (-{priceImpact.toFixed(priceImpact > 3 ? 0 : priceImpact > 1 ? 1 : 2)}%)
              </Typography>
            )}
          </Box>
        </Box>
      </Row>
    </>
  );
};

const MarketOrderTxDetails = ({
  selectedOutputToken,
  customReceivedTitle,
  minimumReceived,
  minimumReceivedUSD,
}: {
  switchRates: SwapQuoteType;
  selectedOutputToken: SwappableToken;
  safeSlippage: number;
  customReceivedTitle?: React.ReactNode;
  minimumReceived: string;
  minimumReceivedUSD: string;
}) => {
  return (
    <>
      <Row
        caption={
          customReceivedTitle || <Trans>{`Minimum ${selectedOutputToken.symbol} received`}</Trans>
        }
        captionVariant="description"
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
              symbol={selectedOutputToken.symbol}
              logoURI={selectedOutputToken.logoURI}
              height="16px"
              width="16px"
              sx={{ mr: 2, ml: 4, fontSize: '16px' }}
            />
            <FormattedNumber
              value={Number(minimumReceived)}
              variant="secondary14"
              compact
              roundDown={true}
            />
          </Box>
          <FormattedNumber
            value={Number(minimumReceivedUSD)}
            variant="helperText"
            compact
            symbol="USD"
            symbolsColor="text.secondary"
            color="text.secondary"
            roundDown={true}
          />
        </Box>
      </Row>
    </>
  );
};
