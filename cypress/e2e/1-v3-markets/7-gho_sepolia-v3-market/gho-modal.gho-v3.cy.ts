import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { DashboardActions } from '../../../support/actions/dashboard.actions';
import { DashboardHelpers } from '../../../support/helpers/dashboard.helper';
import { ModalHelpers } from '../../../support/helpers/modal.helper';
import { configEnvWithTenderlySepoliaGhoFork } from '../../../support/steps/configuration.steps';
import gho from './fixtures/gho.json';
import { tokenSet } from './helpers/token.helper';

const testData = {
  borrow: {
    asset: assets.ghoV3Market.GHO,
    amount: 200,
    apyType: constants.borrowAPYType.default,
    hasApproval: true,
  },
};

describe(`GHO MODAL APY TESTING`, () => {
  describe.skip(`Verify modal without discount APY = ${gho.apy.max}%`, () => {
    configEnvWithTenderlySepoliaGhoFork({
      v3: true,
      tokens: tokenSet({ aDAI: 1000 }),
    });
    before(`Open Modal`, () => {
      cy.doSwitchToDashboardBorrowView();
      DashboardHelpers.openBorrowModal(testData.borrow.asset.shortName);
    });
    //BUG T-5080
    it.skip(`Verify modal without discount APY=${gho.apy.max}%, no amount`, () => {
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(gho.apy.max);
      });
    });
    it(`Verify modal without discount APY=${gho.apy.max}%, some amount`, () => {
      ModalHelpers.setAmount(100);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(gho.apy.max);
      });
    });
    it(`Verify modal without discount APY=${gho.apy.max}%, max amount`, () => {
      ModalHelpers.setAmount(1000, true);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(gho.apy.max);
      });
    });
  });
  describe.skip(`Verify modal with max discount APY = ${gho.apy.min}%`, () => {
    configEnvWithTenderlySepoliaGhoFork({
      v3: true,
      tokens: tokenSet({ stkAave: 50, aDAI: 1000 }),
    });
    before(`Open Modal`, () => {
      cy.doSwitchToDashboardBorrowView();
      DashboardHelpers.openBorrowModal(testData.borrow.asset.shortName);
    });
    //BUG T-5080
    it.skip(`Verify modal with max discount APY=${gho.apy.min}%, no amount`, () => {
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(gho.apy.min);
      });
    });
    it(`Verify modal with max discount APY=${gho.apy.min}%, some amount`, () => {
      ModalHelpers.setAmount(100);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(gho.apy.min);
      });
    });
    it(`Verify modal with max discount APY=${gho.apy.min}%, max amount`, () => {
      ModalHelpers.setAmount(1000, true);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(gho.apy.min);
      });
    });
  });
  describe.skip(`Verify modal in range: min APY ${gho.apy.min}% - max APY ${gho.apy.max}%`, () => {
    configEnvWithTenderlySepoliaGhoFork({
      v3: true,
      tokens: tokenSet({ stkAave: 1.01, aDAI: 12000 }),
    });
    before(`Open Modal`, () => {
      cy.doSwitchToDashboardBorrowView();
      DashboardHelpers.openBorrowModal(testData.borrow.asset.shortName);
    });
    //BUG T-5080 - should be range
    it.skip(`Verify modal with max discount APY=${gho.apy.min}%, no amount`, () => {
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(gho.apy.min);
      });
    });
    it(`Verify modal with max discount APY=${gho.apy.min}%, small amount`, () => {
      ModalHelpers.setAmount(100);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(gho.apy.min);
      });
    });
    it(`Verify modal with some discount ${gho.apy.min}<%APY<${gho.apy.max}%, medium amount`, () => {
      ModalHelpers.setAmount(1000);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.greaterThan(gho.apy.min);
        expect($val).to.be.lessThan(gho.apy.max);
      });
    });
    it(`Verify modal without discount APY=${gho.apy.max}%, max amount`, () => {
      ModalHelpers.setAmount(1000, true);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(gho.apy.max);
      });
    });
  });
  describe(`Verify modal in range: min APY ${gho.apy.min}% - max APY < ${gho.apy.max}%`, () => {
    let maxAPY: number;
    configEnvWithTenderlySepoliaGhoFork({
      v3: true,
      tokens: tokenSet({ stkAave: 1, aDAI: 500 }),
    });
    before(`Open Modal`, () => {
      cy.doSwitchToDashboardBorrowView();
      DashboardHelpers.openBorrowModal(testData.borrow.asset.shortName);
      DashboardHelpers.getGhoApyBorrowRangeMax(gho.shortName).then(($val) => {
        maxAPY = $val;
      });
    });
    //BUG T-5080 - should be range
    it.skip(`Verify modal with max discount APY=${gho.apy.min}%, no amount`, () => {
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(gho.apy.min);
      });
    });
    it(`Verify modal with max discount APY=${gho.apy.min}%, small amount`, () => {
      ModalHelpers.setAmount(1);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(gho.apy.min);
      });
    });
    it(`Verify modal with some discount ${gho.apy.min} < %APY < ${gho.apy.max}%, medium amount`, () => {
      ModalHelpers.setAmount(200);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.greaterThan(gho.apy.min);
        expect($val).to.be.lessThan(maxAPY);
      });
    });
    it(`Verify modal without discount APY=${gho.apy.max}%, max amount`, () => {
      ModalHelpers.setAmount(1000, true);
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(maxAPY);
      });
    });
  });
  describe.skip(`Verify modal with changing discount for APY`, () => {
    let minAPYRage: number;
    let maxAPYRange: number;
    let borrowedAPY: number;
    configEnvWithTenderlySepoliaGhoFork({
      v3: true,
      tokens: tokenSet({ stkAave: 1, aDAI: 500 }),
    });
    DashboardActions.borrow(testData.borrow);
    it(`Open Modal, and save values`, () => {
      cy.doSwitchToDashboardBorrowView();
      DashboardHelpers.openBorrowModal(testData.borrow.asset.shortName);
      cy.wait(5000); //TODO: upgrade to waitUntil
      DashboardHelpers.getGhoApyBorrowRangeMax(gho.shortName).then(($val) => {
        maxAPYRange = $val;
      });
      DashboardHelpers.getGhoApyBorrowRangeMin(gho.shortName).then(($val) => {
        minAPYRage = $val;
      });
      DashboardHelpers.getApyBorrowedRate(gho.shortName).then(($val) => {
        borrowedAPY = $val;
      });
    });
    it(`Verify modal with max discount for this case, no amount`, () => {
      cy.wait(2000); //TODO: upgrade to waitUntil
      ModalHelpers.getApy().then(($val) => {
        expect($val).to.be.eql(borrowedAPY);
        expect($val).to.be.eql(minAPYRage);
      });
    });
    it(`Verify modal with some discount for this case, some amount`, () => {
      ModalHelpers.setAmount(20);
      cy.wait(2000); //TODO: upgrade to waitUntil
      ModalHelpers.getApyOld().then(($val) => {
        expect($val).to.be.eql(borrowedAPY);
        expect($val).to.be.eql(minAPYRage);
      });
      ModalHelpers.getApyNew().then(($val) => {
        expect($val).to.be.greaterThan(borrowedAPY);
        expect($val).to.be.greaterThan(minAPYRage);
        expect($val).to.be.lessThan(maxAPYRange);
      });
    });
    it(`Verify modal with max discount for this case, max amount`, () => {
      ModalHelpers.setAmount(20, true);
      cy.wait(2000); //TODO: upgrade to waitUntil
      ModalHelpers.getApyOld().then(($val) => {
        expect($val).to.be.eql(borrowedAPY);
        expect($val).to.be.eql(minAPYRage);
      });
      ModalHelpers.getApyNew().then(($val) => {
        expect($val).to.be.greaterThan(borrowedAPY);
        expect($val).to.be.greaterThan(minAPYRage);
        expect($val).to.be.eql(maxAPYRange);
      });
    });
  });
});
