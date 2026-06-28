import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

export const useCollateralsAmount = () => {
  const userReserves = useAppDataContext().user?.userReservesData;
  return (
    userReserves?.reduce((acc, reserve) => {
      if (reserve.usageAsCollateralEnabledOnUser) {
        return acc + 1;
      }
      return acc;
    }, 0) ?? 0
  );
};
