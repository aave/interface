# AAVE e2e testing

based on cypress(8.5.0) with `cypress-repeat` and tenderly

---

## Development mode

there is command for development/debuging/local executing tests:

- `yarn run test:open` - it's open visual window with all test and manual executing

_steps:_

1. install dependencies `yarn`
2. add .env.local file to the root folder with:


```sh
TENDERLY_KEY=
TENDERLY_ACCOUNT=Aave
TENDERLY_PROJECT=QA
```

`cp .env.example .env` - execute before spining up environment if you want to check Stake / Governance pages.

3. run `yarn run test:open`

---

## CI mode

there are 2 types of suites:

- `yarn run test:${marketName}-${marketVersion}-smoke` - executing only main specs, using for brunch pr
- `yarn run test:${marketName}-${marketVersion}-full` - executing all specs, using for before live deployment

P.C. for execute those commands locally need to:

1. install dependencies `yarn`
2. add .env.local file to the root folder with:

```sh
TENDERLY_KEY=
TENDERLY_ACCOUNT=Aave
TENDERLY_PROJECT=QA
```

3. add to beginning of command `DOTENV_CONFIG_PATH='.env.local'`
4. run command

---
## Local execution

1. install dependencies `yarn`
2. add .env.local file to the root folder with:

```sh
TENDERLY_KEY=
TENDERLY_ACCOUNT=
TENDERLY_PROJECT=
```

then possible to run all tests by:
```sh
yarn run test:headless
```
or for separate markets:
- ethereum v2 `DOTENV_CONFIG_PATH='.env.local' cypress run --spec 'cypress/e2e/0-v2-markets/0-main-v2-market/**/*'`
- amm v2 `DOTENV_CONFIG_PATH='.env.local' cypress run --spec 'cypress/e2e/0-v2-markets/1-amm-v2-market/**/*'`
- avalanche v2 `DOTENV_CONFIG_PATH='.env.local' cypress run --spec 'cypress/e2e/0-v2-markets/3-avalanche-v2-market/**/*'`
- polygon v2 `DOTENV_CONFIG_PATH='.env.local' cypress run --spec 'cypress/e2e/0-v2-markets/2-polygon-v2-market/**/*'`
- ethereum v3 `DOTENV_CONFIG_PATH='.env.local' cypress run --spec 'cypress/e2e/1-v3-markets/0-ethereum-v3-market/**/*'`
- arbiturm v3 `DOTENV_CONFIG_PATH='.env.local' cypress run --spec 'cypress/e2e/1-v3-markets/1-arbitrum-v3-market/**/*'`
- avalanche v3 `DOTENV_CONFIG_PATH='.env.local' cypress run --spec 'cypress/e2e/1-v3-markets/2-avalanche-v3-market/**/*'`
- polygon v3 `DOTENV_CONFIG_PATH='.env.local' cypress run --spec 'cypress/e2e/1-v3-markets/3-polygon-v3-market/**/*'`
- optimism v3 `DOTENV_CONFIG_PATH='.env.local' cypress run --spec 'cypress/e2e/1-v3-markets/4-optimism-v3-market/**/*'`
