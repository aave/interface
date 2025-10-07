import { normalizeBN } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { ExternalTokenIcon } from 'src/components/primitives/TokenIcon';

import { TxModalDetails } from '../../FlowCommons/TxModalDetails';
import { SwappableToken, SwapParams, SwapProvider, SwapQuoteType, SwapState } from '../types';
import { CowCostsDetails } from './CowCostsDetails';

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
        state={state}
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
  state,
}: {
  switchRates: SwapQuoteType;
  safeSlippage: number;
  customReceivedTitle?: React.ReactNode;
  selectedInputToken: SwappableToken;
  selectedOutputToken: SwappableToken;
  minimumReceived: string;
  minimumReceivedUSD: string;
  state: SwapState;
}) => {
  return switchRates.provider === SwapProvider.COW_PROTOCOL ? (
    <IntentTxDetails
      state={state}
      selectedInputToken={selectedInputToken}
      selectedOutputToken={selectedOutputToken}
      safeSlippage={safeSlippage}
      customReceivedTitle={customReceivedTitle}
      inputTokenPriceUsd={switchRates.srcTokenPriceUsd}
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
  state,
  selectedOutputToken,
  selectedInputToken,
  customReceivedTitle,
  inputTokenPriceUsd,
  inputAmount,
  minimumReceived,
  minimumReceivedUSD,
}: {
  state: SwapState;
  selectedOutputToken: SwappableToken;
  selectedInputToken: SwappableToken;
  safeSlippage: number;
  customReceivedTitle?: React.ReactNode;
  inputTokenPriceUsd: number;
  inputAmount: string;
  minimumReceived: string;
  minimumReceivedUSD: string;
}) => {
  const srcUsd = normalizeBN(inputAmount, selectedInputToken.decimals)
    .multipliedBy(inputTokenPriceUsd)
    .toNumber();

  const receivingInUsd = Number(minimumReceivedUSD);
  const sendingInUsd = srcUsd;

  const priceImpact = (1 - receivingInUsd / sendingInUsd) * 100;

  return (
    <>
      {state.provider === SwapProvider.COW_PROTOCOL && <CowCostsDetails state={state} />}

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
            <DarkTooltip
              title={
                <Typography variant="secondary14" color="common.white">
                  {minimumReceived} {selectedOutputToken.symbol}
                </Typography>
              }
              arrow
              placement="top"
              enterTouchDelay={100}
              leaveTouchDelay={500}
            >
              <Box>
                <FormattedNumber
                  value={minimumReceived}
                  variant="secondary14"
                  compact
                  roundDown={true}
                />
              </Box>
            </DarkTooltip>
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
            <DarkTooltip
              title={
                <Typography variant="secondary14" color="common.white">
                  {minimumReceived} {selectedOutputToken.symbol}
                </Typography>
              }
              arrow
              placement="top"
              enterTouchDelay={100}
              leaveTouchDelay={500}
            >
              <Box>
                <FormattedNumber
                  value={Number(minimumReceived)}
                  variant="secondary14"
                  compact
                  roundDown={true}
                />
              </Box>
            </DarkTooltip>
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
