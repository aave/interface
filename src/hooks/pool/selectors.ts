import { ReservesDataHumanized } from '@aave/contract-helpers';
import { UserReservesDataHumanized } from 'src/services/UIPoolService';

export const selectBaseCurrencyData = (poolReserve: ReservesDataHumanized) =>
  poolReserve.baseCurrencyData;
export const selectReserves = (poolReserve: ReservesDataHumanized) => poolReserve.reservesData;

export const selectUserReservesData = (userPoolReserves: UserReservesDataHumanized) =>
  userPoolReserves.userReserves;
export const selectUserEModeCategory = (userPoolReserves: UserReservesDataHumanized) =>
  userPoolReserves.userEmodeCategoryId;
