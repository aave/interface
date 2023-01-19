import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { DashboardActions } from '../../../support/actions/dashboard.actions';
import { DashboardHelpers } from '../../../support/helpers/dashboard.helper';
import { ModalHelpers } from '../../../support/helpers/modal.helper';
import { configEnvWithTenderlyGoerliGhoFork } from '../../../support/steps/configuration.steps';
import gho from './fixtures/gho.json';
import { tokenSet } from './helpers/token.helper';

const testData = {
  borrow: {
    asset: assets.ghoV3Market.GHO,
    amount: 100,
    apyType: constants.borrowAPYType.default,
    hasApproval: true,
  },
};

describe(`GHO discount integrating testing on modal view`, () => {
  describe(`Verify default APY for GHO`, () => {
    configEnvWithTenderlyGoerliGhoFork({
      v3: true,
      tokens: tokenSet({ aAAVE: 10 }),
    });
    it(`APY for 100 GHO `, () => {
      cy.doSwitchToDashboardBorrowView();
      DashboardHelpers.openBorrowModal(testData.borrow.asset.shortName);
      ModalHelpers.setAmount(100);
      ModalHelpers.getApyRate().then(($val) => {
        expect($val).to.be.eql(gho.apy.max);
      });
    });
    it(`APY for max GHO amount`, () => {
      ModalHelpers.setAmount(100, true);
      ModalHelpers.getApyRate().then(($val) => {
        expect($val).to.be.eql(gho.apy.max);
      });
    });
  });
  describe(`Verify discount of APY with 1 stkAave`, () => {
    let stepBackAPY: number;
    configEnvWithTenderlyGoerliGhoFork({
      v3: true,
      tokens: tokenSet({ aAAVE: 10, stkAave: 1 }),
    });
    it(`APY with max discount`, () => {
      cy.doSwitchToDashboardBorrowView();
      DashboardHelpers.openBorrowModal(gho.shortName);
      ModalHelpers.setAmount(100);
      ModalHelpers.getApyRate().then(($val) => {
        expect($val).to.be.eql(gho.apy.min);
        stepBackAPY = $val;
      });
    });
    it(`APY with medium discount`, () => {
      ModalHelpers.setAmount(500);
      ModalHelpers.getApyRate().then(($val) => {
        expect(stepBackAPY).to.be.lt($val);
        stepBackAPY = $val;
      });
    });
    it(`APY for max amount with discount`, () => {
      ModalHelpers.setAmount(1000, true);
      ModalHelpers.getApyRate().then(($val) => {
        expect(stepBackAPY).to.be.lt($val);
        expect($val).to.be.gt(gho.apy.min);
      });
    });
  });
  describe(`Verify discount with exist borrow GHO position`, () => {
    configEnvWithTenderlyGoerliGhoFork({
      v3: true,
      tokens: tokenSet({ aAAVE: 10, stkAave: 2 }),
    });
    DashboardActions.borrow(testData.borrow);
    it(`APY for max amount with discount`, () => {
      DashboardHelpers.openBorrowModal(gho.shortName);
      ModalHelpers.setAmount(500, true);
      ModalHelpers.getApyRate().then(($val) => {
        expect($val).to.be.gt(gho.apy.min);
      });
    });
  });
});
