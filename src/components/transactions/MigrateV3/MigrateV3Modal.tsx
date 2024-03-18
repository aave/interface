import React from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { useUserMigrationReserves } from 'src/hooks/migration/useUserMigrationReserves';
import { useUserSummaryForMigration } from 'src/hooks/migration/useUserSummaryForMigration';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { selectCurrentChainIdV3MarketData } from 'src/store/poolSelectors';
import { useRootStore } from 'src/store/root';

import { MigrateV3ModalContent } from './MigrateV3ModalContent';

export const MigrateV3Modal = () => {
  const { type, close } = useModalContext();

  const currentChainId = useRootStore((store) => store.currentChainId);
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const toMarketData = selectCurrentChainIdV3MarketData(currentChainId, currentNetworkConfig);
  const fromMarketData = currentMarketData;

  const { data: userMigrationReserves } = useUserMigrationReserves(fromMarketData, toMarketData);
  const { data: toUserSummaryForMigration } = useUserSummaryForMigration(toMarketData);

  return (
    <BasicModal open={type === ModalType.V3Migration} setOpen={close}>
      {userMigrationReserves && toUserSummaryForMigration && (
        <MigrateV3ModalContent
          userMigrationReserves={userMigrationReserves}
          toUserSummaryForMigration={toUserSummaryForMigration}
        />
      )}
    </BasicModal>
  );
};
