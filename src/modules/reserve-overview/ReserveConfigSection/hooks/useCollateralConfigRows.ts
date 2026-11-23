import { t } from '@lingui/macro';
import { useMemo } from 'react';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';

import {
  ConfigRow,
  STANDARD_CONFIG_KEY,
  toConfigAsset,
  toEModeRow,
  toStandardRow,
} from '../utils/configRows';
import { useMarketConfigReserves } from './useMarketConfigReserves';

export const useCollateralConfigRows = (reserve: ReserveWithId): ConfigRow[] => {
  const marketReserves = useMarketConfigReserves();
  const standardLabel = t`Standard`;

  return useMemo(() => {
    const isolated = !!reserve.isolationModeConfig?.canBeCollateral;
    const canBeBorrowed = (candidate: ReserveWithId) =>
      !candidate.isFrozen &&
      !candidate.isPaused &&
      (!isolated || !!candidate.isolationModeConfig?.canBeBorrowed);

    const rows: ConfigRow[] = [];

    const liquidationThreshold = Number(reserve.supplyInfo.liquidationThreshold.value);
    if (liquidationThreshold > 0) {
      const maxLTV = Number(reserve.supplyInfo.maxLTV.value);
      rows.push(
        toStandardRow(reserve, standardLabel, {
          id: STANDARD_CONFIG_KEY,
          maxLTV,
          assets:
            maxLTV > 0
              ? marketReserves
                  .filter(
                    (candidate) =>
                      canBeBorrowed(candidate) &&
                      !!candidate.borrowInfo &&
                      candidate.borrowInfo.borrowingState !== 'DISABLED'
                  )
                  .map(toConfigAsset)
              : [],
        })
      );
    }

    (reserve.eModeInfo ?? [])
      .filter((eMode) => eMode.canBeCollateral)
      .forEach((eMode) => {
        const maxLTV = eMode.hasLtvZero ? 0 : Number(eMode.maxLTV.value);
        rows.push(
          toEModeRow(eMode, {
            maxLTV,
            assets:
              maxLTV > 0
                ? marketReserves
                    .filter(
                      (candidate) =>
                        canBeBorrowed(candidate) &&
                        !!candidate.eModeInfo?.some(
                          (info) => info.categoryId === eMode.categoryId && info.canBeBorrowed
                        )
                    )
                    .map(toConfigAsset)
                : [],
          })
        );
      });

    return rows;
  }, [reserve, marketReserves, standardLabel]);
};
