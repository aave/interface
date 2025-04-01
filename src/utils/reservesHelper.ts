import {
  LegacyUiPoolDataProvider,
  ReservesHelperInput,
  UiPoolDataProvider,
} from '@aave/contract-helpers';

// Define our custom AMM symbol map
export const customAmmSymbolMap: { [key: string]: string } = {
  '0x95e5c474d179e7992d63678bc719a7df5c38caf5': 'UNI_FAVORETH',
  '0xe94a048f20fe2cb75e608c1c2f4b2cf477410222': 'UNI_FAVORUSDT',
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
