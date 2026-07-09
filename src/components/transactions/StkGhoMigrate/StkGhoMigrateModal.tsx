import { Trans } from '@lingui/macro';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { StkGhoMigrateModalContent } from './StkGhoMigrateModalContent';

export const StkGhoMigrateModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;

  return (
    <BasicModal open={type === ModalType.StkGhoMigrate} setOpen={close}>
      <ModalWrapper
        title={<Trans>Migrate stkGHO to sGHO</Trans>}
        underlyingAsset={args.underlyingAsset}
        hideTitleSymbol
      >
        {() => <StkGhoMigrateModalContent />}
      </ModalWrapper>
    </BasicModal>
  );
};
