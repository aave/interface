# Contributing

## Objective of the Aave Interface

The Aave interface is managed by the Aave Companies. It is hosted on IPFS and can be accessed at [app.aave.com](app.aave.com). It is an open source project that allows users to interact with the decentralized liquidity protocol, Aave. The interface allows users to

- Manage and monitor their positions on the Aave protocol
- Manage and monitor their positions on the Aave Safety module
- Participate in Aave Governance

Our aim is to be as open and transparent as possible, and we welcome contributions from all community members. This document and our guidelines are a work in progress, but we hope to provide you with enough information to make the process as smooth as possible.

## Maintainers Responsitibility on the Aave Interface

- Review all PRs that get created on any repositories that fall under Aave Interface
  - [aave/interface](https://github.com/aave/interface)
  - [aave/utilities](https://github.com/aave/aave-utilities)
- Determine the roadmap of features that will be included on the AI
- Maintaining the security, usability, and style of the codebase, including any integrations with third party services

## Reporting New Features, Improvements & Bugs

We use the Issues list in GitHub to keep track of all work going on in the project. If you would like to report a new bug or an improvement, please use the existing templates after making sure your bug or request doesn’t already exist. To report a new issue, follow these steps:

1. Go to [https://github.com/aave/interface/issues/new/choose](https://github.com/aave/interface/issues/new/choose)
2. Choose the category for the issue - Bug Report or Feature Request
3. If reporting a bug, include as much information as possible in your PR, and follow the steps in the template, as they are pretty self-explanatory
4. If reporting a new feature, do the same
5. Once the issue is created, it will get a “New Issue” label. This is an indication for the Aave Interface Team to triage the new request.

## Picking up an Issue for Work

Whether you’re a first time or existing contributor to the project, you may do so by picking up any issue that has the label “Looking for Help”, as this will be the right place to start. These issues will have been triaged already by the Aave Interface Team.

Follow these steps once you’ve identified an issue you want to pick up:

1. Comment on the issue expressing interest. A member of the Aave Interface Team will assign it to you.

> 💡 **In order to mitigate issues from becoming stale, we may reassign or un-assign an issue after an extended period of time if we see that no commits are occurring on it. We will reach out to the original assignee in these instances**

2. Fork the repo if you haven’t done so already.
3. Create a branch for the issue by clicking `Create a branch` in the Development section on the Issue page. We follow Conventional Commits and follow the branch naming convention of `[verb]/[issue number]-[branch name]`. Some examples are:
   1. `fix/123-squashed-bug`
   2. `feat/321-my-new-feature`
4. Please add a comment on the issue so other people know it is being worked on.
5. Commit work using conventional commit formatting. There is a pre-commit hook with Husky that will enforce this. See the Running the UI Locally section for how to get the project running locally.
6. Create a pull request by using the single PR template. Fill out the list of major changes that are happening in the codebase. These bullet points should be a high-level overview / at-a-glance of the major changes to ease reviews. Go over the `Author Checklist` items in the template, and ensure all of them have been met before opening for review.
7. Code review. We might request you to make changes and iterate until we feel the code is ready.
8. QA and design review. If anything comes up during testing, or if there are any UI/UX items that need to be addressed, we’ll let you know.
9. Once there is two approvals, the Pull Request can be merged.

# Running the Interface Locally

## Initial setup

```sh
# potentially you can user other node versions, but it's only tested on what's currently listed in nvmrc
nvm use
yarn install
cp .env.example .env.local
```

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
# setting the environment to 'staging' will enable testnet markets, disabling governance, staking, and production markets
NEXT_PUBLIC_ENV=prod
# you can also disable staking & governance by altering
NEXT_PUBLIC_ENABLE_GOVERNANCE=true
NEXT_PUBLIC_ENABLE_STAKING=true
```

## Test

The integration test suite runs against tenderly forks of various networks. To setup the local environment you need to add environment variables accordingly:

```sh
TENDERLY_KEY=<api key>
TENDERLY_ACCOUNT=<account name>
TENDERLY_PROJECT=<project name>
```

For setup env with staking page (to get positive result for staking test coverage), need to execute:

```
cp .env.example .env.local
```

For running the integration test suite you need to run the app. You can either run again `yarn dev` which will be a bit more resource intensive as the app will be build on the fly or run against a static build via `yarn build:static` & `yarn serve:static`.

```sh
# open interactive cypress test suite
yarn test:open
# run all tests in headless mode
yarn test:headless
```

## Run on a fork

You can run the ui against a forked network similar to what the tests do which allows you to play around on the ui without spending actual funds.
To enable forks in the ui, you have to run the following commands in console.

```js
localStorage.setItem('forkEnabled', 'true');
localStorage.setItem('forkBaseChainId', 1); // the networkId you are forking
localStorage.setItem('forkNetworkId', '3030'); // the networkId on the fork
localStorage.setItem('forkRPCUrl', <rpcurl>);
```

As localeStorage is not observed you need to **reload** after setting the parameters.
Now the market selection should show forked markets for all the markets that run on `forkBaseChainId`.
To do actual transactions on the fork you need to setup your wallet to use the same `rpcurl` you provided as `forkRPCUrl`.

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

To add a new language first start an issue to check for public interest.
If the community decides to go forward with your preferred language follow [this pr](https://github.com/aave/interface/pull/447#issue-1165545965) to add support for a new language.
