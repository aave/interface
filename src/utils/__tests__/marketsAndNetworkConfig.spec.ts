import { ChainId } from '@aave/contract-helpers';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { getProvider } from '../marketsAndNetworksConfig';
import { RotationProvider } from '../rotationProvider';

it('should use a RotationProvider when there are multiple rpc urls configured for a network', () => {
  const provider = getProvider(ChainId.mainnet);
  expect(provider).toBeInstanceOf(RotationProvider);
});

it('should use a StaticJsonRpcProvider when there is only one rpc url configured for a network', () => {
  const provider = getProvider(ChainId.polygon);
  expect(provider).toBeInstanceOf(StaticJsonRpcProvider);
});
