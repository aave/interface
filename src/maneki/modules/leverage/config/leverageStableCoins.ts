/**
 * supported stable coin symbols borrows for leverage
 */

import { IleverageBorrowAsset } from '../../../hooks/leverage-data-provider/LeverageDataProvider';

export const LEVERAGE_STABLE_COINS: IleverageBorrowAsset[] = [
  { symbol: 'USDC', address: '0x1234' },
  { symbol: 'USDT', address: '0x1234' },
];
