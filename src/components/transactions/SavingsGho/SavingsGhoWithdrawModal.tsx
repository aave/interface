import { Trans } from '@lingui/macro';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { SavingsGhoModalWithdrawContent } from './SavingsGhoWithdrawModalContent';

export const SavingsGhoWithdrawModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;

  return (
    <BasicModal open={type === ModalType.SavingsGhoWithdraw} setOpen={close}>
      <ModalWrapper
        title={<Trans>Withdraw GHO</Trans>}
        underlyingAsset={args.underlyingAsset}
        hideTitleSymbol
      >
        {(params) => <SavingsGhoModalWithdrawContent {...params} icon="GHO" />}
      </ModalWrapper>
    </BasicModal>
  );
};
