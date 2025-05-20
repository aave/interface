import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { ModalType } from 'src/hooks/useModal';

import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { BaseSwitchModal } from './BaseSwitchModal';
import { SwitchDetailsParams as SwitchDetailsParams } from './BaseSwitchModalContent';

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
    const maxFee = Number(switchRates.srcUSD) - usdValue;

    return switchRates && user ? (
      <TxModalDetails gasLimit={gasLimit} chainId={selectedChainId} showGasStation={showGasStation}>
        <Row
          caption={<Trans>{`Minimum ${selectedOutputToken.symbol} received`}</Trans>}
          captionVariant="caption"
        >
          <FormattedNumber
            compact={false}
            roundDown={true}
            variant="caption"
            value={
              Number(normalize(switchRates.destAmount, switchRates.destDecimals)) *
              (1 - safeSlippage)
            }
          />
        </Row>
        <Row
          sx={{ mt: 1 }}
          caption={<Trans>Minimum USD value received</Trans>}
          captionVariant="caption"
        >
          <FormattedNumber
            symbol="usd"
            symbolsVariant="caption"
            variant="caption"
            value={usdValue}
            visibleDecimals={2}
          />
        </Row>
        <Row sx={{ mt: 1 }} caption={<Trans>Max fee</Trans>} captionVariant="caption">
          <FormattedNumber
            symbol="usd"
            visibleDecimals={2}
            symbolsVariant="caption"
            variant="caption"
            value={maxFee}
          />
        </Row>
      </TxModalDetails>
    ) : null;
  };

  return <BaseSwitchModal modalType={ModalType.Switch} switchDetails={switchDetails} />;
};
