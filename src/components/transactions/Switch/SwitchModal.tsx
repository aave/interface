import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { ModalType } from 'src/hooks/useModal';

import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { BaseSwitchModal } from './BaseSwitchModal';
import { SwitchDetailsParams as SwitchDetailsParams } from './BaseSwitchModalContent';
import { isCowProtocolRates } from './switch.types';

export const SwitchModal = () => {
  const switchDetails = ({
    user,
    switchRates,
    gasLimit,
    selectedChainId,
    selectedOutputToken,
    safeSlippage,
    showGasStation,
  }: SwitchDetailsParams) => {
    const usdValue = Number(switchRates.destUSD) * (1 - safeSlippage);

    const costs: {
      beforeNetworkCostsInUsd: number;
      networkFeesInUsd: number;
      partnerFeesInUsd: number;
      slippageInUsd: number;
      totalCostsInUsd: number;
    } = {
      beforeNetworkCostsInUsd: 0,
      networkFeesInUsd: 0,
      partnerFeesInUsd: 0,
      slippageInUsd: 0,
      totalCostsInUsd: 0,
    };

    if (isCowProtocolRates(switchRates)) {
      costs.beforeNetworkCostsInUsd =
        Number(
          normalize(
            switchRates.amountAndCosts.beforeNetworkCosts.buyAmount.toString(),
            switchRates.destDecimals
          )
        ) * switchRates.destTokenPriceUsd;
      costs.networkFeesInUsd =
        Number(
          normalize(
            switchRates.amountAndCosts.costs.networkFee.amountInBuyCurrency.toString(),
            switchRates.destDecimals
          )
        ) * switchRates.destTokenPriceUsd;
      costs.partnerFeesInUsd =
        Number(
          normalize(
            switchRates.amountAndCosts.costs.partnerFee.amount.toString(),
            switchRates.destDecimals
          )
        ) * switchRates.destTokenPriceUsd;
      const amountInUsd = Number(switchRates.srcUSD);
      const slippageInUsd = safeSlippage * amountInUsd;
      costs.slippageInUsd = slippageInUsd;
      costs.totalCostsInUsd = costs.networkFeesInUsd + costs.partnerFeesInUsd + costs.slippageInUsd;
    }

    return switchRates && user ? (
      <TxModalDetails gasLimit={gasLimit} chainId={selectedChainId} showGasStation={showGasStation}>
        <Row mb={4} caption={<Trans>{`Amount`}</Trans>} captionVariant="description">
          <FormattedNumber
            compact={false}
            symbol="usd"
            symbolsVariant="caption"
            roundDown={false}
            variant="caption"
            visibleDecimals={2}
            value={costs.beforeNetworkCostsInUsd}
          />
        </Row>

        <Accordion
          sx={{
            mb: 4,
            boxShadow: 'none',
            '&:before': { display: 'none' },
            backgroundColor: 'transparent',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              padding: 0,
              minHeight: 'unset',
              '.MuiAccordionSummary-content': { margin: 0 },
            }}
          >
            <Row caption={<Trans>{`Costs & Fees`}</Trans>} captionVariant="description">
              <FormattedNumber
                compact={false}
                symbol="usd"
                symbolsVariant="caption"
                roundDown={false}
                variant="caption"
                visibleDecimals={2}
                value={costs.totalCostsInUsd}
              />
            </Row>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0 }}>
            <Row mb={2} caption={<Trans>{`Network costs`}</Trans>} captionVariant="description">
              <FormattedNumber
                compact={false}
                symbol="usd"
                symbolsVariant="caption"
                roundDown={false}
                variant="caption"
                visibleDecimals={2}
                value={costs.networkFeesInUsd}
              />
            </Row>
            <Row mb={2} caption={<Trans>{`Fee`}</Trans>} captionVariant="description">
              <FormattedNumber
                compact={false}
                symbol="usd"
                symbolsVariant="caption"
                roundDown={false}
                variant="caption"
                visibleDecimals={2}
                value={costs.partnerFeesInUsd}
              />
            </Row>
            <Row caption={<Trans>{`Slippage`}</Trans>} captionVariant="description">
              <FormattedNumber
                compact={false}
                symbol="usd"
                symbolsVariant="caption"
                roundDown={false}
                variant="caption"
                visibleDecimals={2}
                value={costs.slippageInUsd}
              />
            </Row>
          </AccordionDetails>
        </Accordion>

        <Row
          mb={4}
          caption={<Trans>{`Minimum ${selectedOutputToken.symbol} received after slippage`}</Trans>}
          captionVariant="description"
        >
          <FormattedNumber
            compact={false}
            roundDown={false}
            visibleDecimals={2}
            variant="caption"
            value={
              Number(normalize(switchRates.destAmount, switchRates.destDecimals)) *
              (1 - safeSlippage)
            }
          />
        </Row>
        <Row
          mb={4}
          caption={<Trans>Minimum USD value received after slippage</Trans>}
          captionVariant="description"
        >
          <FormattedNumber
            symbol="usd"
            symbolsVariant="caption"
            roundDown={false}
            variant="caption"
            value={usdValue}
            visibleDecimals={2}
          />
        </Row>
      </TxModalDetails>
    ) : null;
  };

  return <BaseSwitchModal modalType={ModalType.Switch} switchDetails={switchDetails} />;
};
