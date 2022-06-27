import { configEnvWithTenderlyMainnetFork } from '../../../support/steps/configuration.steps';
import {
  supply,
  borrow,
  repay,
  withdraw,
  changeCollateral,
  changeCollateralNegative,
} from '../../../support/steps/main.steps';
import {
  borrowsUnavailable,
  dashboardAssetValuesVerification,
} from '../../../support/steps/verification.steps';
import { skipState } from '../../../support/steps/common';
import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import {doCloseModal, doConfirm, setAmount} from '../../../support/steps/actions.steps';
import {descending} from "d3-array";

describe('STAKE INTEGRATION SPEC, AAVE V2 MARKET', () => {
  configEnvWithTenderlyMainnetFork({
    tokens: [{ address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9' }],
  });
  describe(`Stake amount`, () => {
    it(`Open staking page`, () => {
      cy.get('[data-cy="menuStake"]').click();
    });
    it(`Open stake modal`, () => {
      cy.get(`button[data-cy="stakeBtn_AAVE"]`).should('not.be.disabled').click();
    });
    it(`Put amount`, () => {
      setAmount({
        amount: 1000,
        max: false,
      });
      doConfirm({
        hasApproval: false,
        actionName: 'Stake',
      });
    });
    doCloseModal();
    it(`Check staked amount`, ()=>{
      cy.wait(4000);
      cy.get(`[data-cy="stakedBox_AAVE"]`).find(`[data-cy="amountNative"]`).should('have.text', '1,000.00');
      cy.get(`[data-cy="stakedBox_AAVE"]`).find(`[data-cy="amountUSD"]`).should('not.have.text', '$ 0');
      cy.get(`[data-cy="rewardBox_AAVE"]`).find(`[data-cy="amountNative"]`).should('not.have.text', '0');
      cy.get(`[data-cy="rewardBox_AAVE"]`).find(`[data-cy="amountUSD"]`).should('not.have.text', ' $0');
    });
  });
  describe(`Claim reward`, () => {
    it(`Open claim popup`, () => {
      cy.get(`[data-cy="claimBtn_AAVE"]`).click();
    });
    it(`Confirm`, () => {
      doConfirm({
        hasApproval: false,
        actionName: 'STAKE AAVE',
      });
    });
  });
});
