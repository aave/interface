import React from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { useUmbrellaSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

import { UmbrellaModalContent } from './UmbrellaModalContent';

export const UmbrellaModal = () => {
  const { type, close, args } = useModalContext();
  const currentMarketData = useRootStore((store) => store.currentMarketData);

  const { data } = useUmbrellaSummary(currentMarketData);

  const stakeData = data?.find(
    (item) => item.stakeToken.toLowerCase() === args?.uStakeToken?.toLowerCase()
  );

  return (
    <BasicModal open={type === ModalType.Umbrella} setOpen={close}>
      {args?.icon && stakeData && <UmbrellaModalContent icon={args.icon} stakeData={stakeData} />}
    </BasicModal>
  );
};
