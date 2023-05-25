import { PERMISSION } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import React, { useEffect, useState } from 'react';
import { getPythInfo, usingMockPyth } from 'src/helpers/pythHelpers';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { BorrowModalContent } from './BorrowModalContent';

export const BorrowModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  const [borrowUnWrapped, setBorrowUnWrapped] = useState(true);

  const [price, setPrice] = useState<string>('0');
  const [expo, setExpo] = useState<number>(0);
  const [updateData, setUpdateData] = useState<string[]>([]);

  useEffect(() => {
    async function getLatestPriceInfo() {
      const pythInfo = await getPythInfo([args['underlyingAsset']], usingMockPyth);
      const latestPriceFeeds = pythInfo['prices'];

      const latestPriceRaw = latestPriceFeeds ? latestPriceFeeds[0]['price']['price'] : '0';
      setPrice(latestPriceRaw);

      const latestPriceExpo = latestPriceFeeds ? latestPriceFeeds[0]['price']['expo'] : '-8';
      setExpo(latestPriceExpo);

      const latestPriceUpdateData = pythInfo['updateData'];
      setUpdateData(latestPriceUpdateData);
    }
    if (typeof args['underlyingAsset'] !== 'undefined') {
      getLatestPriceInfo();
    }
  }, [args]);

  return (
    <BasicModal open={type === ModalType.Borrow} setOpen={close}>
      <ModalWrapper
        title={<Trans>Borrow</Trans>}
        underlyingAsset={args.underlyingAsset}
        keepWrappedSymbol={!borrowUnWrapped}
        requiredPermission={PERMISSION.BORROWER}
      >
        {(params) => (
          <BorrowModalContent
            {...params}
            unwrap={borrowUnWrapped}
            setUnwrap={setBorrowUnWrapped}
            latestPriceRaw={price!}
            latestPriceExpo={expo!}
            latestPriceUpdateData={updateData!}
          />
        )}
      </ModalWrapper>
    </BasicModal>
  );
};
