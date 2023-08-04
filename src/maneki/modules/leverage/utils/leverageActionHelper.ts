import { BigNumber } from 'ethers';

export interface collateralAssetsType {
  token: string;
  address: string;
  value: BigNumber;
  balance: BigNumber;
  decimals: number;
}

export type reservesTokensTuple = [string, string];

export function convertReserveTokens(
  reservesTokens: reservesTokensTuple[]
): collateralAssetsType[] {
  const reservesTokensAddress: collateralAssetsType[] = reservesTokens.map(([token, address]) => {
    if (address.toLowerCase() === '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'.toLowerCase())
      token = 'USDC.e';
    if (address.toLowerCase() === '0x5402B5F40310bDED796c7D0F3FF6683f5C0cFfdf'.toLowerCase())
      token = 'GLP';
    return {
      token,
      address,
      value: BigNumber.from(0),
      balance: BigNumber.from(0),
      decimals: 0,
    };
  });
  return reservesTokensAddress;
}
