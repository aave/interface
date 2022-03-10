import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import React from 'react';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { RateSwitchModalContent } from './RateSwitchModalContent';

export const RateSwitchModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
    currentRateMode: InterestRate;
  }>;

  return (
    <BasicModal open={type === ModalType.RateSwitch} setOpen={close}>
      <ModalWrapper
        hideTitleSymbol
        title={<Trans>Switch APY type</Trans>}
        underlyingAsset={args.underlyingAsset}
      >
        {(params) => <RateSwitchModalContent {...params} currentRateMode={args.currentRateMode} />}
      </ModalWrapper>
    </BasicModal>
  );
};
