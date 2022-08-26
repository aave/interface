import 'cypress-wait-until';

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
