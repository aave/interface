import { CoWProtocolSupportedNetworks } from 'src/components/transactions/Switch/switch.constants';
import { SwitchProvider } from 'src/components/transactions/Switch/switch.types';

/**
 * As for now, we prioritize CoWProtocol over Paraswap, please check with BD for further details.
 */
export function getSwapProvider(chainId: number): SwitchProvider | undefined {
  if (CoWProtocolSupportedNetworks.includes(chainId)) {
    return 'cowprotocol';
  }

  return 'paraswap';
}
