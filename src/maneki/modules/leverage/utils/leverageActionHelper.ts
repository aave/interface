import { BigNumber } from 'ethers';

export interface collateralAssetsType {
  token: string;
  address: string;
  value: BigNumber;
  balance: BigNumber;
  decimals: number;
}

export type reservesTokensTuple = [string, string];

export function convertReservesTokens(
  reservesTokens: reservesTokensTuple[]
): collateralAssetsType[] {
  const reservesTokensAddress: collateralAssetsType[] = reservesTokens.map(([token, address]) => ({
    token,
    address,
    value: BigNumber.from(0),
    balance: BigNumber.from(0),
    decimals: 0,
  }));
  return reservesTokensAddress;
}
