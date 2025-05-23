import { ModalType } from 'src/hooks/useModal';

import { BaseSwitchModal } from './BaseSwitchModal';
import { SwitchDetailsParams as SwitchDetailsParams } from './BaseSwitchModalContent';
import { SwitchModalTxDetails } from './SwitchModalTxDetails';

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
    return switchRates && user ? (
      <SwitchModalTxDetails
        switchRates={switchRates}
        selectedOutputToken={selectedOutputToken}
        safeSlippage={safeSlippage}
        gasLimit={gasLimit}
        selectedChainId={selectedChainId}
        showGasStation={showGasStation}
      />
    ) : null;
  };

  return <BaseSwitchModal modalType={ModalType.Switch} switchDetails={switchDetails} />;
};
