import { BigNumber } from 'ethers';

// Claimables

export interface Claimables {
  token: string;
  amount: BigNumber;
}

export type ClaimablesTuple = [string, BigNumber];

export function convertClaimables(claimables: ClaimablesTuple[]): Claimables[] {
  const claimablesObject: Claimables[] = claimables.map(([token, amount]) => ({
    token,
    amount,
  }));
  return claimablesObject;
}

// VestEntry

export interface VestEntry {
  amount: BigNumber;
  expiry: BigNumber;
}

export type VestEntryTuple = [BigNumber, BigNumber];

export function convertVestEntry(claimables: VestEntryTuple[]): VestEntry[] {
  const claimablesObject: VestEntry[] = claimables.map(([amount, expiry]) => ({
    amount,
    expiry,
  }));
  return claimablesObject;
}
