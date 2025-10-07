import { normalize, normalizeBN } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { useState } from 'react';
import { NetworkCostTooltip } from 'src/components/infoTooltips/NetworkCostTooltip';
import { SwapFeeTooltip } from 'src/components/infoTooltips/SwapFeeTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { ExternalTokenIcon } from 'src/components/primitives/TokenIcon';
import { ExtendedFormattedUser } from 'src/hooks/app-data-provider/useAppDataProvider';

import { TxModalDetails } from '../../FlowCommons/TxModalDetails';
import { SwappableToken, SwapParams, SwapProvider, SwapQuoteType, SwapState } from '../types';

export const SwapDetails = ({ params, state }: { params: SwapParams; state: SwapState }) => {
  return (
    <SwitchModalTxDetails
      switchRates={state.swapRate}
      selectedOutputToken={state.destinationToken}
      safeSlippage={state.safeSlippage}
      gasLimit={state.gasLimit}
      selectedChainId={state.chainId}
      customReceivedTitle={params.customReceivedTitle}
      selectedInputToken={state.sourceToken}
    />
  );
};

export const SwitchModalTxDetails = ({
  switchRates,
  selectedOutputToken,
  safeSlippage,
  gasLimit,
  selectedChainId,
  customReceivedTitle,
  selectedInputToken,
}: {
  switchRates?: SwapQuoteType;
  safeSlippage: number;
  gasLimit: string;
  selectedChainId: number;
  customReceivedTitle?: React.ReactNode;
  user?: ExtendedFormattedUser;
  selectedInputToken: SwappableToken;
  selectedOutputToken: SwappableToken;
}) => {
  if (!switchRates) return null;

  return (
    <TxModalDetails
      gasLimit={gasLimit}
      chainId={selectedChainId}
      showGasStation={switchRates.provider !== SwapProvider.COW_PROTOCOL}
    >
      {switchRates.provider === SwapProvider.COW_PROTOCOL ? (
        <IntentTxDetails
          selectedInputToken={selectedInputToken}
          selectedOutputToken={selectedOutputToken}
          safeSlippage={safeSlippage}
          customReceivedTitle={customReceivedTitle}
          networkFee={switchRates.amountAndCosts.costs.networkFee.amountInBuyCurrency.toString()}
          partnerFee={switchRates.amountAndCosts.costs.partnerFee.amount.toString()}
          outputAmount={switchRates.destAmount}
          inputTokenPriceUsd={switchRates.srcTokenPriceUsd}
          outputTokenPriceUsd={switchRates.destTokenPriceUsd}
          inputAmount={switchRates.srcAmount}
        />
      ) : (
        <MarketOrderTxDetails
          switchRates={switchRates}
          selectedOutputToken={selectedOutputToken}
          safeSlippage={safeSlippage}
          customReceivedTitle={customReceivedTitle}
        />
      )}
    </TxModalDetails>
  );
};

export const IntentTxDetails = ({
  selectedOutputToken,
  selectedInputToken,
  safeSlippage,
  customReceivedTitle,
  networkFee,
  partnerFee,
  outputTokenPriceUsd,
  inputTokenPriceUsd,
  outputAmount,
  inputAmount,
}: {
  selectedOutputToken: SwappableToken;
  selectedInputToken: SwappableToken;
  safeSlippage: number;
  customReceivedTitle?: React.ReactNode;
  networkFee: string;
  partnerFee: string;
  outputTokenPriceUsd: number;
  inputTokenPriceUsd: number;
  outputAmount: string;
  inputAmount: string;
}) => {
  const [costBreakdownExpanded, setCostBreakdownExpanded] = useState(false);

  const networkFeeFormatted = normalize(networkFee, selectedOutputToken.decimals);
  const networkFeeUsd = Number(networkFeeFormatted) * outputTokenPriceUsd;

  const partnerFeeFormatted = normalize(partnerFee, selectedOutputToken.decimals);
  const partnerFeeUsd = Number(partnerFeeFormatted) * outputTokenPriceUsd;

  const totalCostsInUsd = networkFeeUsd + partnerFeeUsd; // + costs.slippageInUsd;

  const destUsd = normalizeBN(outputAmount, selectedOutputToken.decimals)
    .multipliedBy(outputTokenPriceUsd)
    .toNumber();
  const srcUsd = normalizeBN(inputAmount, selectedInputToken.decimals)
    .multipliedBy(inputTokenPriceUsd)
    .toNumber();

  const receivingInUsd = destUsd * (1 - safeSlippage);
  const sendingInUsd = srcUsd;

  const priceImpact = (1 - receivingInUsd / sendingInUsd) * 100;

  const destAmountAfterSlippage = normalizeBN(outputAmount, selectedOutputToken.decimals)
    .multipliedBy(1 - safeSlippage)
    .decimalPlaces(selectedOutputToken.decimals, BigNumber.ROUND_UP)
    .toString();

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
              value={destAmountAfterSlippage}
              variant="secondary14"
              compact
              roundDown={true}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormattedNumber
              value={Number(destUsd) * (1 - safeSlippage)}
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
  switchRates,
  selectedOutputToken,
  safeSlippage,
  customReceivedTitle,
}: {
  switchRates: SwapQuoteType;
  selectedOutputToken: SwappableToken;
  safeSlippage: number;
  customReceivedTitle?: React.ReactNode;
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
              value={Number(
                normalize(
                  Number(switchRates.destAmount) * (1 - safeSlippage),
                  switchRates.destDecimals
                )
              )}
              variant="secondary14"
              compact
              roundDown={true}
            />
          </Box>
          <FormattedNumber
            value={Number(switchRates.destUSD) * (1 - safeSlippage)}
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
