// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// injects a web3 provider into the local window state

// import { ChainId } from '@aave/contract-helpers';
// import { MARKETS } from './steps/common';
// import { configEnvWithTenderly } from './steps/configuration.steps';

// https://github.com/quasarframework/quasar/issues/2233
const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;
Cypress.on('uncaught:exception', (err) => {
  /* returning false here prevents Cypress from failing the test */
  if (resizeObserverLoopErrRe.test(err.message)) {
    return false;
  }
});

// Cypress.Commands.add('initFork', (market, tokens = []) => {
//   if (!Object.keys(MARKETS).includes(market)) throw new Error(`not sure how to setup ${market}`);
//   if (market === MARKETS.fork_proto_mainnet)
//     configEnvWithTenderly({ chainId: ChainId.mainnet, market, tokens });
//   if (market === MARKETS.fork_amm_mainnet)
//     configEnvWithTenderly({ chainId: ChainId.mainnet, market, tokens });
//   if (market === MARKETS.fork_proto_avalanche)
//     configEnvWithTenderly({ chainId: ChainId.avalanche, market, tokens });
//   if (market === MARKETS.fork_proto_matic)
//     configEnvWithTenderly({ chainId: ChainId.polygon, market, tokens });
// });

export {};
