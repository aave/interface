import { Suspense } from 'react';
import { useModalStore } from 'src/store/useModalStore';

import { MODAL_COMPONENTS } from './const';

export default function ModalProvider() {
  const { activeModal, closeModal } = useModalStore();

  if (!activeModal) return null;

  const Component = MODAL_COMPONENTS[activeModal.type] as React.ComponentType<
    { open: boolean; onClose: () => void } & typeof activeModal['props']
  >;

  return (
    <Suspense>
      <Component open onClose={closeModal} {...activeModal.props} />
    </Suspense>
  );
}
