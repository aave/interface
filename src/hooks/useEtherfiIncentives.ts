import { ProtocolAction } from '@aave/contract-helpers';

import { CustomMarket } from '../ui-config/marketsConfig';

const getetherfiData = (
  market: string,
  protocolAction: ProtocolAction,
  symbol: string
): number | undefined => ETHERFI_DATA_MAP.get(`${market}-${protocolAction}-${symbol}`);

const ETHERFI_DATA_MAP: Map<string, number> = new Map([
  [`${CustomMarket.proto_mainnet_v3}-${ProtocolAction.supply}-weETH`, 3],
  [`${CustomMarket.proto_mainnet_v3}-${ProtocolAction.supply}-eBTC`, 3],
  [`${CustomMarket.proto_etherfi_v3}-${ProtocolAction.supply}-weETH`, 3],
  [`${CustomMarket.proto_lido_v3}-${ProtocolAction.supply}-weETH`, 3],
  [`${CustomMarket.proto_arbitrum_v3}-${ProtocolAction.supply}-weETH`, 3],
  [`${CustomMarket.proto_base_v3}-${ProtocolAction.supply}-weETH`, 3],
  [`${CustomMarket.proto_scroll_v3}-${ProtocolAction.supply}-weETH`, 3],
  [`${CustomMarket.proto_zksync_v3}-${ProtocolAction.supply}-weETH`, 3],
  [`${CustomMarket.proto_linea_v3}-${ProtocolAction.supply}-weETH`, 3],
  [`${CustomMarket.proto_plasma_v3}-${ProtocolAction.supply}-weETH`, 3],
]);

export const useEtherfiIncentives = (
  market: string,
  symbol: string,
  protocolAction?: ProtocolAction
) => {
  if (!market || !protocolAction || !symbol) {
    return undefined;
  }

  return getetherfiData(market, protocolAction, symbol);
};
