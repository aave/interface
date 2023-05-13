import { Trans } from '@lingui/macro';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { ManekiModalWrapper } from 'src/maneki/utils/ManekiModalWrapper';

import { ManageModalContent } from './ManageModalContent';

export const ManageModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <>
      {type == ModalType.ManageStake && (
        <BasicModal open={type === ModalType.ManageStake} setOpen={close}>
          <ManekiModalWrapper
            title={<Trans>Manage Stake</Trans>}
            symbol={'PAW'}
            action={'Staked'}
            amount={args.manageAmount}
          >
            {(params) => <ManageModalContent {...params} amount={args.manageAmount || '0'} />}
          </ManekiModalWrapper>
        </BasicModal>
      )}
      {type == ModalType.ManageLock && (
        <BasicModal open={type === ModalType.ManageLock} setOpen={close}>
          <ManekiModalWrapper
            title={<Trans>Manage Lock</Trans>}
            symbol={'PAW'}
            action={'Locked'}
            amount={args.manageAmount}
          >
            {(params) => <ManageModalContent {...params} amount={args.manageAmount || '0'} />}
          </ManekiModalWrapper>
        </BasicModal>
      )}
    </>
  );
};
