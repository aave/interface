import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box } from '@mui/material';
import { useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
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
  showGasStation,
}: {
  switchRates: SwitchRatesType;
  selectedOutputToken: TokenInfoWithBalance;
  safeSlippage: number;
  gasLimit: string;
  selectedChainId: number;
  showGasStation: boolean | undefined;
}) => {
  return (
    <TxModalDetails gasLimit={gasLimit} chainId={selectedChainId} showGasStation={showGasStation}>
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

  const networkCostsTooltip = (
    <TextWithTooltip variant="caption" text={<Trans>Network costs</Trans>}>
      <Trans>
        This is the cost of settling your order on-chain, including gas and any LP fees.
      </Trans>
    </TextWithTooltip>
  );

  const feeTooltip = (
    <TextWithTooltip variant="caption" text={<Trans>Fee</Trans>}>
      <Trans>Fees are applied to ensure the best experience with Aave.</Trans>
    </TextWithTooltip>
  );

  return (
    <>
      <Accordion
        sx={{
          mb: 4,
          boxShadow: 'none',
          '&:before': { display: 'none' },
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
            minHeight: 'unset',
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
              value={
                Number(normalize(switchRates.destAmount, switchRates.destDecimals)) *
                (1 - safeSlippage)
              }
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
