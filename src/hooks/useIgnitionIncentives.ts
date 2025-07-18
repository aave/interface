import { ProtocolAction } from '@aave/contract-helpers';

import { CustomMarket } from '../ui-config/marketsConfig';

const getIgnitionData = (
  market: string,
  protocolAction: ProtocolAction,
  symbol: string
): number | undefined => IGNITION_DATA_MAP.get(`${market}-${protocolAction}-${symbol}`);

const IGNITION_DATA_MAP: Map<string, number> = new Map([
  [`${CustomMarket.proto_mainnet_v3}-${ProtocolAction.supply}-FBTC`, 4],
]);

export const useIgnitionIncentives = (
  market: string,
  symbol: string,
  protocolAction?: ProtocolAction
) => {
  if (!market || !protocolAction || !symbol) {
    return undefined;
  }

  return getIgnitionData(market, protocolAction, symbol);
};
