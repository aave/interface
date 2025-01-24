import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { UnStakeModalContent } from './UnstakeModalContent';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { useUmbrellaSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { useRootStore } from 'src/store/root';

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
