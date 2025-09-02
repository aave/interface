import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ModalType } from 'src/hooks/useModal';

import { BaseSwitchModal } from './BaseSwitchModal';
import { SwitchDetailsParams as SwitchDetailsParams } from './BaseSwitchModalContent';
import { SwitchModalTxDetails } from './SwitchModalTxDetails';

export const SwitchModal = () => {
  const { reserves, user: userData } = useAppDataContext();
  const switchDetails = ({
    switchRates,
    gasLimit,
    selectedChainId,
    selectedInputToken,
    selectedOutputToken,
    safeSlippage,
    showGasStation,
  }: SwitchDetailsParams) => {
    return switchRates && userData ? (
      <SwitchModalTxDetails
        switchRates={switchRates}
        selectedOutputToken={selectedOutputToken}
        safeSlippage={safeSlippage}
        gasLimit={gasLimit}
        selectedChainId={selectedChainId}
        showGasStation={showGasStation}
        reserves={reserves}
        user={userData}
        selectedInputToken={selectedInputToken}
        modalType={ModalType.Switch}
      />
    ) : null;
  };

  return <BaseSwitchModal modalType={ModalType.Switch} switchDetails={switchDetails} />;
};
