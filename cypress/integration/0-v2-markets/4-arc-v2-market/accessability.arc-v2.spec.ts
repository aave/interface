import { configEnvWithTenderlyMainnetFork } from '../../../support/steps/configuration.steps';

const FULL_WALLET = {address: `0x008c8395eaba2553cde019af1be19a89630e031f`, privateKey: `57bc64f070aeb5ed6f69398ef933e55b74de7a7ec3ebe40f5f009a31a3eff151`}


describe('ACCESS ARC, INTEGRATION SPEC', () => {
    configEnvWithTenderlyMainnetFork({
        // market: `fork_arc_v2`,
        // wallet: FULL_WALLET,
        tokens: [{address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"}]
    });
    describe('Check that deposit is block for usual customer', () => {
        it('Blabla', () => {
            cy.log("blabla")
        })
    })
    // describe('Check that deposit unlock for half access customer', () => {
    //     it('Blabla', () => {
    //         cy.log("blabla")
    //     })
    // })
    // describe('Check that deposit and swap unlock for half access customer', () => {
    //     it('Blabla', () => {
    //         cy.log("blabla")
    //     })
    // })
});
