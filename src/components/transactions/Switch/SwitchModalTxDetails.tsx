import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { Row } from 'src/components/primitives/Row';
import { ExternalTokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';

import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { isCowProtocolRates, SwitchRatesType } from './switch.types';

export const SwitchModalTxDetails = ({
  switchRates,
  selectedOutputToken,
  safeSlippage,
  gasLimit,
  selectedChainId,
}: {
  switchRates: SwitchRatesType;
  selectedOutputToken: TokenInfoWithBalance;
  safeSlippage: number;
  gasLimit: string;
  selectedChainId: number;
  showGasStation: boolean | undefined;
}) => {
  return (
    <TxModalDetails
      gasLimit={gasLimit}
      chainId={selectedChainId}
      showGasStation={switchRates.provider !== 'cowprotocol'}
    >
      {switchRates.provider === 'cowprotocol' ? (
        <IntentTxDetails
          switchRates={switchRates}
          selectedOutputToken={selectedOutputToken}
          safeSlippage={safeSlippage}
        />
      ) : (
        <MarketOrderTxDetails
          switchRates={switchRates}
          selectedOutputToken={selectedOutputToken}
          safeSlippage={safeSlippage}
        />
      )}
    </TxModalDetails>
  );
};
const IntentTxDetails = ({
  switchRates,
  selectedOutputToken,
  safeSlippage,
}: {
  switchRates: SwitchRatesType;
  selectedOutputToken: TokenInfoWithBalance;
  safeSlippage: number;
}) => {
  const [costBreakdownExpanded, setCostBreakdownExpanded] = useState(false);

  if (!isCowProtocolRates(switchRates)) {
    throw new Error('Invalid switch rates');
  }

  const networkFee = switchRates.amountAndCosts.costs.networkFee.amountInBuyCurrency.toString();
  const networkFeeFormatted = normalize(networkFee, switchRates.destDecimals);
  const networkFeeUsd = Number(networkFeeFormatted) * switchRates.destTokenPriceUsd;

  const partnerFee = switchRates.amountAndCosts.costs.partnerFee.amount.toString();
  const partnerFeeFormatted = normalize(partnerFee, switchRates.destDecimals);
  const partnerFeeUsd = Number(partnerFeeFormatted) * switchRates.destTokenPriceUsd;

  const totalCostsInUsd = networkFeeUsd + partnerFeeUsd; // + costs.slippageInUsd;

  const receivingInUsd = Number(switchRates?.destUSD) * (1 - safeSlippage);
  const sendingInUsd = Number(switchRates?.srcUSD);

  const priceImpact = !switchRates ? undefined : (1 - receivingInUsd / sendingInUsd) * 100;

  const networkCostsTooltip = (
    <TextWithTooltip variant="caption" text={<Trans>Network costs</Trans>}>
      <Trans>
        This is the cost of settling your order on-chain, including gas and any LP fees.
      </Trans>
    </TextWithTooltip>
  );

  const feeTooltip = (
    <TextWithTooltip variant="caption" text={<Trans>Fee</Trans>}>
      <Trans>
        Fees help support the user experience and security of the Aave application.{' '}
        <Link
          href="https://aave.com/docs/developers/smart-contracts/swap-features"
          target="_blank"
          rel="noopener"
        >
          Learn more.
        </Link>
      </Trans>
    </TextWithTooltip>
  );

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
            caption={networkCostsTooltip}
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
          <Row mx={2} mb={2} caption={feeTooltip} captionVariant="caption" align="flex-start">
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
        caption={<Trans>{`Minimum ${selectedOutputToken.symbol} received`}</Trans>}
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
              sx={{ mr: 2, ml: 4, fontSize: '16px' }}
            />
            <FormattedNumber
              value={
                Number(normalize(switchRates.destAmount, switchRates.destDecimals)) *
                (1 - safeSlippage)
              }
              variant="secondary14"
              compact
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormattedNumber
              value={Number(switchRates.destUSD) * (1 - safeSlippage)}
              variant="helperText"
              compact
              symbol="USD"
              symbolsColor="text.secondary"
              color="text.secondary"
            />
            {/* Price impact */}
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
}: {
  switchRates: SwitchRatesType;
  selectedOutputToken: TokenInfoWithBalance;
  safeSlippage: number;
}) => {
  return (
    <>
      <Row
        caption={<Trans>{`Minimum ${selectedOutputToken.symbol} received`}</Trans>}
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
            />
          </Box>
          <FormattedNumber
            value={Number(switchRates.destUSD) * (1 - safeSlippage)}
            variant="helperText"
            compact
            symbol="USD"
            symbolsColor="text.secondary"
            color="text.secondary"
          />
        </Box>
      </Row>
    </>
  );
};
