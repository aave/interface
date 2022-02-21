import { AaveGovernanceService } from '@aave/contract-helpers';
import { governanceConfig } from '../../../ui-config/governanceConfig';
import { getProvider } from '../../../utils/marketsAndNetworksConfig';

let governanceContract: AaveGovernanceService;

if (governanceConfig) {
  governanceContract = new AaveGovernanceService(getProvider(governanceConfig.chainId), {
    GOVERNANCE_ADDRESS: governanceConfig.addresses.AAVE_GOVERNANCE_V2,
    GOVERNANCE_HELPER_ADDRESS: governanceConfig.addresses.AAVE_GOVERNANCE_V2_HELPER,
  });
}

export { governanceContract };
