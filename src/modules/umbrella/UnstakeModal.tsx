import { Trans } from '@lingui/macro';
import React from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalWrapper } from 'src/components/transactions/FlowCommons/ModalWrapper';
import { UserAuthenticated } from 'src/components/UserAuthenticated';
import { useUmbrellaSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { zeroAddress } from 'viem';

import { UnStakeModalContent } from './UnstakeModalContent';

export const UnStakeModal = () => {
  const { type, close, args } = useModalContext();
  const currentMarketData = useRootStore((store) => store.currentMarketData);

  const { data } = useUmbrellaSummary(currentMarketData);

  const stakeData = data?.stakeData.find(
    (item) => item.tokenAddress.toLowerCase() === args?.uStakeToken?.toLowerCase()
  );

  const underlyingAsset =
    args.stataTokenAsset === zeroAddress
      ? args.underlyingTokenAddress?.toLowerCase()
      : args.stataTokenAsset?.toLowerCase();

  return (
    <BasicModal open={type === ModalType.UmbrellaUnstake} setOpen={close}>
      <ModalWrapper title={<Trans>Unstake</Trans>} underlyingAsset={underlyingAsset || ''}>
        {(params) => (
          <UserAuthenticated>
            {(user) =>
              stakeData && <UnStakeModalContent user={user} stakeData={stakeData} {...params} />
            }
          </UserAuthenticated>
        )}
      </ModalWrapper>
    </BasicModal>
  );
};
