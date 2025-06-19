import { Trans } from '@lingui/macro';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { SavingsGhoModalDepositContent } from './SavingsGhoModalDepositContent';

export const SavingsGhoDepositModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;

  return (
    <BasicModal open={type === ModalType.SavingsGhoDeposit} setOpen={close}>
      <ModalWrapper
        title={<Trans>Deposit GHO</Trans>}
        underlyingAsset={args.underlyingAsset}
        hideTitleSymbol
      >
        {() => <SavingsGhoModalDepositContent />}
      </ModalWrapper>
    </BasicModal>
  );
};
