import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
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
    } = {
      beforeNetworkCostsInUsd: 0,
      networkFeesInUsd: 0,
      partnerFeesInUsd: 0,
      slippageInUsd: 0,
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

        <Row mb={4} caption={<Trans>{`Network costs`}</Trans>} captionVariant="description">
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
        <Row mb={4} sx={{ mt: 1 }} caption={<Trans>{`Fees`}</Trans>} captionVariant="description">
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
        <Row
          mb={4}
          sx={{ mt: 1 }}
          caption={<Trans>{`Slippage`}</Trans>}
          captionVariant="description"
        >
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

        <Row
          mb={4}
          sx={{ mt: 1 }}
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
          sx={{ mt: 1 }}
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
