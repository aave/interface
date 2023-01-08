# AAVE e2e testing

based on cypress(8.5.0) with `cypress-repeat` and tenderly

---

## Development mode

there is command for development/debugging/local executing tests:

- `yarn run test:open` - it's open visual window with all test and manual executing

_steps:_

1. install dependencies `yarn`
2. add .env.local file to the root folder with:

```sh
TENDERLY_KEY=
TENDERLY_ACCOUNT=Aave
TENDERLY_PROJECT=QA
```

`cp .env.example .env` - execute before spinning up environment if you want to check Stake / Governance pages.

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
