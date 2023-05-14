import { Trans } from '@lingui/macro';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { ManekiModalWrapper } from 'src/maneki/utils/ManekiModalWrapper';

import { ManageModalClaims } from './ManageModalClaims';
import { ManageModalContent } from './ManageModalContent';

export const ManageModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <>
      {type == ModalType.ManageStake && (
        <BasicModal open={type === ModalType.ManageStake} setOpen={close}>
          <ManekiModalWrapper
            title={<Trans>Stake</Trans>}
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
            title={<Trans>Lock</Trans>}
            symbol={'PAW'}
            action={'Locked'}
            amount={args.manageAmount}
          >
            {(params) => <ManageModalContent {...params} amount={args.manageAmount || '0'} />}
          </ManekiModalWrapper>
        </BasicModal>
      )}
      {type == ModalType.ManageClaim && (
        <BasicModal open={type === ModalType.ManageClaim} setOpen={close}>
          {/* Do something here for claims */}
          <ManekiModalWrapper
            title={<Trans>Claim</Trans>}
            symbol={'PAW'}
            action={'Claimed'}
            amount={args.manageAmount}
          >
            {(params) => <ManageModalClaims {...params} amount={args.manageAmount || '0'} />}
          </ManekiModalWrapper>
        </BasicModal>
      )}
    </>
  );
};
