import { Dispatch, useEffect } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

import { isProtocolSwapParams, SwapParams, SwapState } from '../types';

export const useProtocolReserves = ({
  state,
  params,
  setState,
}: {
  state: SwapState;
  params: SwapParams;
  setState: Dispatch<Partial<SwapState>>;
}) => {
  const { user } = useAppDataContext();

  const userReserves = user?.userReservesData;

  useEffect(() => {
    if (state.sourceToken && isProtocolSwapParams(params)) {
      const reserve = userReserves?.find(
        (r) => r.underlyingAsset.toLowerCase() === state.sourceToken.underlyingAddress.toLowerCase()
      );
      if (reserve) {
        setState({ sourceReserve: reserve });
      }
    }
  }, [state.sourceToken, userReserves]);

  useEffect(() => {
    if (state.destinationToken && isProtocolSwapParams(params)) {
      const reserve = userReserves?.find(
        (r) =>
          r.underlyingAsset.toLowerCase() === state.destinationToken.underlyingAddress.toLowerCase()
      );
      if (reserve) {
        setState({ destinationReserve: reserve });
      }
    }
  }, [state.destinationToken, userReserves]);
};
