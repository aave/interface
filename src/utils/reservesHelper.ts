import {
  LegacyUiPoolDataProvider,
  ReservesHelperInput,
  UiPoolDataProvider,
} from '@aave/contract-helpers';

// Define our custom AMM symbol map
export const customAmmSymbolMap: { [key: string]: string } = {
  '0x2b9fd97c76580516076f7f2732db140798f36f08': 'UNISETHETH',
  '0xe94a048f20fe2cb75e608c1c2f4b2cf477410222': 'UNIUSDT',
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
