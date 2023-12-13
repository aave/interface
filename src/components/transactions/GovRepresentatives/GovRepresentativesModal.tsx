import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { GovRepresentativesContent } from './GovRepresentativesModalContent';

export const GovRepresentativesModal = () => {
  const { type, close } = useModalContext();
  return (
    <BasicModal open={type === ModalType.GovRepresentatives} setOpen={close}>
      <GovRepresentativesContent />
    </BasicModal>
  );
};
