import { PERMISSION } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import React, { useEffect, useState } from 'react';
import { getLatestPriceFeeds } from 'src/helpers/pythHelpers';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { SupplyModalContent } from './SupplyModalContent';

export const SupplyModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;

  const [price, setPrice] = useState<string>();
  const [expo, setExpo] = useState<number>();

  useEffect(() => {
    async function getLatestPriceInfo() {
      const latestPriceFeeds = await getLatestPriceFeeds([args['underlyingAsset']]); //TODO: replace with underlying asset
      const latestPriceRaw = latestPriceFeeds ? latestPriceFeeds[0]['price']['price'] : '0';
      setPrice(latestPriceRaw);
      const latestPriceExpo = latestPriceFeeds ? latestPriceFeeds[0]['price']['expo'] : '0';
      setExpo(latestPriceExpo);
    }
    getLatestPriceInfo();
  }, []);

  return (
    <BasicModal open={type === ModalType.Supply} setOpen={close}>
      <ModalWrapper
        title={<Trans>Supply</Trans>}
        underlyingAsset={args.underlyingAsset}
        requiredPermission={PERMISSION.DEPOSITOR}
      >
        {(params) => (
          <SupplyModalContent
            modalWrapperProps={params}
            latestPriceRaw={price!}
            latestPriceExpo={expo!}
          />
        )}
      </ModalWrapper>
    </BasicModal>
  );
};
