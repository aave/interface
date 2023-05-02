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

export function convertUnixToDate(unixTimestamp: number) {
  const date = new Date(unixTimestamp);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  };

  const formattedDate = date.toLocaleDateString('en-US', options);
  const timezoneOffset = date.getTimezoneOffset() * -1; // get the timezone offset in minutes and invert it
  const timezone =
    (timezoneOffset >= 0 ? '+' : '-') +
    ('00' + Math.floor(Math.abs(timezoneOffset) / 60)).slice(-2) +
    ':' +
    ('00' + (Math.abs(timezoneOffset) % 60)).slice(-2); // calculate the timezone string

  return `${formattedDate} T${timezone}`;
}
