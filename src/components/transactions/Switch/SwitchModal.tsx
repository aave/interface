import { ModalType } from 'src/hooks/useModal';

import { BaseSwitchModal } from './BaseSwitchModal';

export const SwitchModal = () => {
  return <BaseSwitchModal modalType={ModalType.Switch} />;
};
