import { repayCollateral } from '../../../support/steps/multi.steps';
import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { configEnvWithTenderlyAvalancheFork } from '../../../support/steps/configuration.steps';

const testData = {
  USDTCase: {
    deposit: {
      asset: assets.avalancheV3Market.AVAX,
      amount: 100,
      hasApproval: true,
    },
    borrow: {
      asset: assets.avalancheV3Market.USDT,
      amount: 10,
      apyType: constants.borrowAPYType.variable,
      hasApproval: true,
    },
    repay: {
      asset: assets.avalancheV3Market.USDT,
      apyType: constants.apyType.variable,
      amount: 10,
      hasApproval: false,
      repayOption: constants.repayType.collateral,
    },
  },
  USDCCase: {
    deposit: {
      asset: assets.avalancheV3Market.AVAX,
      amount: 100,
      hasApproval: true,
    },
    borrow: {
      asset: assets.avalancheV3Market.USDC,
      amount: 10,
      apyType: constants.borrowAPYType.stable,
      hasApproval: true,
    },
    repay: {
      asset: assets.avalancheV3Market.USDC,
      apyType: constants.apyType.stable,
      amount: 10,
      hasApproval: false,
      repayOption: constants.repayType.collateral,
    },
  },
};

const configEnv = () =>
  configEnvWithTenderlyAvalancheFork({ market: 'fork_proto_avalanche_v3', v3: true });

describe('REPAY AS COLLATERAL, AVALANCHE V3 MARKET, INTEGRATION SPEC', () => {
  repayCollateral(testData.USDCCase, configEnv);
  repayCollateral(testData.USDTCase, configEnv);
});
