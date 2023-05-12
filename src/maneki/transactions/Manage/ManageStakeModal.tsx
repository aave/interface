import { Trans } from '@lingui/macro';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { ManekiModalWrapper } from 'src/maneki/utils/ManekiModalWrapper';

import { ManageModalContent } from './ManageModalContent';

export const ManageStakeModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <BasicModal open={type === ModalType.ManageStake} setOpen={close}>
      <ManekiModalWrapper title={<Trans>Manage Stake</Trans>} symbol={'PAW'}>
        {(params) => <ManageModalContent {...params} amount={args.manageAmount || '0'} />}
      </ManekiModalWrapper>
    </BasicModal>
  );
};
