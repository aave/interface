import { ChainId } from '@aave/contract-helpers';

import { getProvider } from '../marketsAndNetworksConfig';
import { RotationProvider } from '../rotationProvider';

it('should use a RotationProvider when there are multiple rpc urls configured for a network', () => {
  const provider = getProvider(ChainId.mainnet);
  expect(provider).toBeInstanceOf(RotationProvider);
});
