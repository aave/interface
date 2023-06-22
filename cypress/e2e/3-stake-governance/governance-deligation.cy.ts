import assets from '../../fixtures/assets.json';
import { skipState } from '../../support/steps/common';
import { configEnvWithTenderlyMainnetFork } from '../../support/steps/configuration.steps';
import { delegate, revoke, verifyPower } from '../../support/steps/governance.steps';

const initAssets = {
  aave: {
    asset: assets.staking.AAVE,
    amount: 1000,
    checkAmount: '1,000.00',
  },
  stkAave: {
    asset: assets.staking.stkAAVE,
    amount: 1000,
    checkAmount: '1,000.00',
  },
};

const testData = {
  wallet1: {
    address: '0x48E775A840aAc01fA53676f52d60AA487984bC34',
    mask: '0x48...bC34',
  },
  wallet2: {
    address: '0x3618D4cc9a7630Ac8f09E73C6e167A4c6c3749e2',
    mask: '0x36...49e2',
  },
};
// skip while tenderly issue
describe.skip(`DELEGATION SPEC`, () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyMainnetFork({
    tokens: [
      { tokenAddress: initAssets.aave.asset.address },
      { tokenAddress: initAssets.stkAave.asset.address },
    ],
  });
  describe(`Open page`, () => {
    it(`Open governance page`, () => {
      cy.get('[data-cy="menuGovernance"]').click();
      cy.get('button:contains("Your info")').click();
    });
  });
  delegate(
    {
      asset: initAssets.stkAave.asset,
      walletAddress: testData.wallet1.address,
      walletMask: testData.wallet1.mask,
    },
    skipTestState,
    true
  );
  delegate(
    {
      asset: initAssets.aave.asset,
      walletAddress: testData.wallet2.address,
      walletMask: testData.wallet2.mask,
    },
    skipTestState,
    true
  );
  verifyPower(
    {
      votingPower: '0',
      propositionPower: '0',
    },
    skipTestState,
    false
  );
  revoke({ asset: initAssets.aave.asset }, skipTestState, true);
  revoke({ asset: initAssets.stkAave.asset, isChoice: false }, skipTestState, true);
  verifyPower(
    {
      votingPower: '2,000.00',
      propositionPower: '2,000.00',
    },
    skipTestState,
    false
  );
});
