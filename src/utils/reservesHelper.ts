import {
  LegacyUiPoolDataProvider,
  ReservesHelperInput,
  UiPoolDataProvider,
} from '@aave/contract-helpers';

// Define our custom AMM symbol map
export const customAmmSymbolMap: { [key: string]: string } = {
  '0x4b924585f452aff3c511b0cc12927708fa1da1b8': 'UNI_FAVORETH/ETH',
  '0x9d2bd1ad45c46a1c00b8bd614b15e9fd093218ca': 'UNI_FAVORUSDT/USDT',
  // Add more mappings as needed
};

export async function getCustomReservesHumanized(
  poolDataProvider: LegacyUiPoolDataProvider | UiPoolDataProvider,
  input: ReservesHelperInput
) {
  // First get the original reserves data
  const reservesData = await poolDataProvider.getReservesHumanized(input);

  // Then modify the response to use our custom AMM symbols
  const modifiedReserves = reservesData.reservesData.map((reserve) => {
    const customSymbol = customAmmSymbolMap[reserve.underlyingAsset.toLowerCase()];
    if (customSymbol) {
      return {
        ...reserve,
        symbol: customSymbol,
      };
    }
    return reserve;
  });

  return {
    ...reservesData,
    reservesData: modifiedReserves,
  };
}
