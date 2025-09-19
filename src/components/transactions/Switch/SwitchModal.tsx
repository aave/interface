import { useState } from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { BaseSwitchModal } from './BaseSwitchModal';
import { SwitchLimitOrdersModalContent } from './SwitchLimitOrdersModalContent';
import { SwitchType, SwitchTypeSelector } from './SwitchTypeSelector';

export const SwitchModal = () => {
  const { type, close } = useModalContext();
  const [switchType, setSwitchType] = useState(SwitchType.MARKET);
  return (
    <BasicModal open={type === ModalType.Switch} setOpen={close}>
      <TxModalTitle title={`Swap Assets`} />
      <SwitchTypeSelector switchType={switchType} setSwitchType={setSwitchType} />
      {switchType === SwitchType.MARKET && <BaseSwitchModal modalType={ModalType.Switch} />}
      {switchType === SwitchType.LIMIT && <SwitchLimitOrdersModalContent />}
    </BasicModal>
  );
};
