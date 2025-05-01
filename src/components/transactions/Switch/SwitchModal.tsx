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
    switchProvider,
  }: SwitchDetailsParams) => {
    return switchRates && user ? (
      <TxModalDetails
        gasLimit={gasLimit}
        chainId={selectedChainId}
        showGasStation={switchProvider !== 'cowprotocol'}
      >
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
            value={Number(switchRates.destUSD) * (1 - safeSlippage)}
          />
        </Row>
      </TxModalDetails>
    ) : null;
  };

  return <BaseSwitchModal modalType={ModalType.Switch} switchDetails={switchDetails} />;
};
