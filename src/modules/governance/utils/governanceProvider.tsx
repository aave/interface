import { AaveGovernanceService } from '@aave/contract-helpers';

import { governanceConfig, governanceV3Config } from '../../../ui-config/governanceConfig';
import { getProvider } from '../../../utils/marketsAndNetworksConfig';

export const governanceContract = new AaveGovernanceService(
  getProvider(governanceV3Config.coreChainId),
  {
    GOVERNANCE_ADDRESS: governanceConfig.addresses.AAVE_GOVERNANCE_V2,
    GOVERNANCE_HELPER_ADDRESS: governanceConfig.addresses.AAVE_GOVERNANCE_V2_HELPER,
  }
);
