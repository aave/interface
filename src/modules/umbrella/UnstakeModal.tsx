import React from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { useUmbrellaSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

import { UnStakeModalContent } from './UnstakeModalContent';

export const UnStakeModal = () => {
  const { type, close, args } = useModalContext();
  const currentMarketData = useRootStore((store) => store.currentMarketData);

  const { data } = useUmbrellaSummary(currentMarketData);

  const stakeData = data?.find(
    (item) => item.stakeToken.toLowerCase() === args?.uStakeToken?.toLowerCase()
  );

  return (
    <BasicModal open={type === ModalType.UmbrellaUnstake} setOpen={close}>
      {stakeData && <UnStakeModalContent stakeData={stakeData} />}
    </BasicModal>
  );
};
