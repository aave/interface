import { valueToBigNumber } from '@aave/math-utils';
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
  if (
    !state.swapRate ||
    !state.sellAmountToken ||
    !state.buyAmountToken ||
    !state.sellAmountUSD ||
    !state.buyAmountUSD ||
    !state.sellAmountFormatted ||
    !state.buyAmountFormatted
  )
    return null;

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
        sellToken={state.sellAmountToken}
        buyToken={state.buyAmountToken}
        buyAmount={state.buyAmountFormatted}
        buyAmountUSD={state.buyAmountUSD}
        state={state}
      />
    </TxModalDetails>
  );
};

export const SwapModalTxDetails = ({
  switchRates,
  buyToken,
  buyAmount,
  buyAmountUSD,
  safeSlippage,
  customReceivedTitle,
  sellToken,
  state,
}: {
  switchRates: SwapQuoteType;
  safeSlippage: number;
  customReceivedTitle?: React.ReactNode;
  sellToken: SwappableToken;
  buyToken: SwappableToken;
  buyAmount: string;
  buyAmountUSD: string;
  state: SwapState;
}) => {
  return switchRates.provider === SwapProvider.COW_PROTOCOL ? (
    <IntentTxDetails
      state={state}
      sellToken={sellToken}
      buyToken={buyToken}
      safeSlippage={safeSlippage}
      customReceivedTitle={customReceivedTitle}
      sellTokenPriceUsd={Number(state.sellAmountUSD)}
      sellAmount={switchRates.srcSpotAmount}
      buyAmount={buyAmount}
      buyAmountUSD={buyAmountUSD}
    />
  ) : (
    <MarketOrderTxDetails
      buyToken={buyToken}
      safeSlippage={safeSlippage}
      customReceivedTitle={customReceivedTitle}
      buyAmount={buyAmount}
      buyAmountUSD={buyAmountUSD}
    />
  );
};

export const IntentTxDetails = ({
  state,
  buyToken,
  customReceivedTitle,
  sellTokenPriceUsd,
  sellAmount,
  buyAmount,
  buyAmountUSD,
}: {
  state: SwapState;
  buyToken: SwappableToken;
  sellToken: SwappableToken;
  safeSlippage: number;
  customReceivedTitle?: React.ReactNode;
  sellTokenPriceUsd: number;
  sellAmount: string;
  buyAmount: string;
  buyAmountUSD: string;
}) => {
  const srcUsd = valueToBigNumber(sellAmount).multipliedBy(sellTokenPriceUsd).toNumber();

  const receivingInUsd = Number(buyAmountUSD);
  const sendingInUsd = srcUsd;
  console.log({
    sellTokenPriceUsd,
    receivingInUsd,
    sendingInUsd,
  });

  const priceImpact = (1 - receivingInUsd / sendingInUsd) * 100;

  return (
    <>
      {state.provider === SwapProvider.COW_PROTOCOL && <CowCostsDetails state={state} />}

      <Row
        mb={4}
        caption={customReceivedTitle || <Trans>{`Minimum ${buyToken.symbol} received`}</Trans>}
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
              symbol={buyToken.symbol}
              logoURI={buyToken.logoURI}
              height="16px"
              width="16px"
              sx={{ mr: 2, ml: 4, fontSize: '16px' }}
            />
            <DarkTooltip
              title={
                <Typography variant="secondary14" color="common.white">
                  {buyAmount} {buyToken.symbol}
                </Typography>
              }
              arrow
              placement="top"
              enterTouchDelay={100}
              leaveTouchDelay={500}
            >
              <Box>
                <FormattedNumber value={buyAmount} variant="secondary14" compact roundDown={true} />
              </Box>
            </DarkTooltip>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormattedNumber
              value={Number(buyAmountUSD)}
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
  buyToken,
  customReceivedTitle,
  buyAmount,
  buyAmountUSD,
}: {
  buyToken: SwappableToken;
  safeSlippage: number;
  customReceivedTitle?: React.ReactNode;
  buyAmount: string;
  buyAmountUSD: string;
}) => {
  return (
    <>
      <Row
        caption={customReceivedTitle || <Trans>{`Minimum ${buyToken.symbol} received`}</Trans>}
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
              symbol={buyToken.symbol}
              logoURI={buyToken.logoURI}
              height="16px"
              width="16px"
              sx={{ mr: 2, ml: 4, fontSize: '16px' }}
            />
            <DarkTooltip
              title={
                <Typography variant="secondary14" color="common.white">
                  {buyAmount} {buyToken.symbol}
                </Typography>
              }
              arrow
              placement="top"
              enterTouchDelay={100}
              leaveTouchDelay={500}
            >
              <Box>
                <FormattedNumber
                  value={Number(buyAmount)}
                  variant="secondary14"
                  compact
                  roundDown={true}
                />
              </Box>
            </DarkTooltip>
          </Box>
          <FormattedNumber
            value={Number(buyAmountUSD)}
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
