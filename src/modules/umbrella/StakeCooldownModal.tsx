import React from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { useUmbrellaSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

import { StakeCooldownModalContent } from './StakeCooldownModalContent';

export const StakeCooldownModal = () => {
  const { type, close, args } = useModalContext();

  const currentMarketData = useRootStore((store) => store.currentMarketData);

  const { data } = useUmbrellaSummary(currentMarketData);

  const stakeData = data?.stakeData.find(
    (item) => item.tokenAddress.toLowerCase() === args?.uStakeToken?.toLowerCase()
  );

  return (
    <BasicModal open={type === ModalType.UmbrellaStakeCooldown} setOpen={close}>
      {stakeData && <StakeCooldownModalContent stakeData={stakeData} />}
    </BasicModal>
  );
};
