import { Trans } from '@lingui/macro';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { ManekiModalWrapper } from 'src/maneki/components/ManekiModalWrapper';

import { TGEModalActions } from './TGEModalActions';

export default function TGEModal() {
  const { type, close, args } = useModalContext();
  return (
    <BasicModal open={type === ModalType.TGEContribute} setOpen={close}>
      <ManekiModalWrapper
        title={<Trans>Contribute</Trans>}
        symbol={'BNB'}
        action={'Contributed'}
        amount={args.manageAmount}
      >
        {(params) => <TGEModalActions {...params} amount={args.manageAmount || '0'} />}
      </ManekiModalWrapper>
    </BasicModal>
  );
}
