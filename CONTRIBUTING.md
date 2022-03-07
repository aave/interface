# Contributing

## Initial setup

```sh
# potentially you can user other node versions, but it's only tested on what's currently listed in nvmrc
nvm use
yarn install
# optional, but needed for running tests
cp .env.example .env
```

## Running the interface

```sh
yarn dev
```

## Build

```sh
# builds the app for usage on serverless & containered hosting platforms like vercel
yarn build
# builds the app as a static bundle to be hosted on ipfs
yarn build:static
```

### Environment

```sh
# you can default enable testnets by setting the following environment variable
ENABLE_TESTNET=true
```

## Test

The integration test suite runs against tenderly forks of various networks. To setup the local environment you need to add environment variables accordingly:

```sh
TENDERLY_KEY=<api key>
TENDERLY_ACCOUNT=<account name>
TENDERLY_PROJECT=<project name>
```

For running the integration test suite you need to run the app. You can either run again `yarn dev` which will be a bit more resource intensive as the app will be build on the fly or run against a static build via `yarn build:static` & `yarn serve:static`.

```sh
# open interactive cypress test suite
yarn test:open
# run all tests in headless mode
yarn test:headless
# test a selected markets in headless mode
yarn test:amm|main|polygon|avalanche
```

## Token addition

To add a new token to the app, all you have to do is adding a svg token icon inside `public/icons/tokens` please make sure the svg name equals the `lowercase` onchain `symbol`.
If you want a custom name to appear alongside the icon you can alter `src/ui-config/reservePatches.ts` accordingly.


## Translations

Aave uses [Crowdin](https://crowdin.com/project/aave-interface) for translation management.

Feel free to reach out to us on discord to become a translator!

We only update strings within the app. Everything else is downloaded from crowdin.

[Crowdin Docs](https://support.crowdin.com/enterprise/cli/) for installation of the cli

To upload strings

```sh

crowdin upload sources

```

To download strings

```sh

crowdin download

```