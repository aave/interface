# Objective of the Aave Interface

The website-hosted user interface at app.aave.com (the “Interface”) is provided by the Aave Companies, a group of software development companies that build open source, blockchain-based software. The Interface is hosted on the Interplanetary File System (“IPFS”), is open source and provides information to users regarding the (a) the Aave Protocol, a decentralized, non-custodial liquidity protocol on the Ethereum blockchain that allows users to supply or borrow cryptoassets and earn interest on supplied assets (the “Aave Protocol”); (b) the Aave Safety Module, the primary mechanism for securing the Aave Protocol (the “Aave Safety Module”); and (c) Aave Governance, the mechanism through which AAVE token holders collectively discuss, propose, and vote on upgrades to the Aave Protocol (“Aave Governance”).

The Interface serves as an informational gateway, which allows users to:
- Monitor their positions on the Aave Protocol;
- Monitor their positions on the Aave Safety Module; and
- Monitor and coordinate participation in Aave Governance.

Given the nature of decentralized blockchain technology, the Aave Protocol can either be accessed though the Interface, directly through smart contracts, or through third party protocol integrators. The Interface is a public good, along with the hundreds of other, unaffiliated on-ramps into the Aave Protocol.  Our aim, in the interest of decentralization, is transparency and contributions from all community members only enhance the Aave Protocol ecosystem. This document and the below guidelines will constantly evolve – including with input from the community – but will endeavor to provide you with information about navigating the Interface smoothly.

# Aave Team Responsibilities on the Aave Interface
The Aave team has certain responsibilities with respect to the Aave Interface. This includes the following:
- Review all PRs that get created on any repositories that fall under Aave Interface;
  - aave/interface
  - aave/aave-utilities
- Determine the roadmap of features that will be included on the Aave Interface; and
- Maintaining the security, usability, and style of the codebase, including any integrations with third party services

# Reporting New Features, Improvements & Bugs
The “Issues List” in GitHub keeps track of all work on the Interface. If you would like to report a bug or an improvement to the Interface, please use the existing templates after making sure that the discovered bug doesn’t already exist. To report a new issue, follow these steps:
1. Go to https://github.com/aave/interface/issues/new/choose;
2. Choose the category for the issue - Bug Report or Feature Request;
3. If reporting a bug, include as much information as possible in your PR, and follow the steps in the template, as they are pretty self-explanatory;
4. If reporting a new feature, do the same; and
5. Once the issue is created, it will get a “New Issue” label, which is a helpful indication for the Interface Team to triage the new request.

# Picking up an issue for work
Whether you’re a first time or existing contributor to the Interface and/or the Aave ecosystem, you may engage by picking up any issue that is labelled “Looking for Help,” as this will be the right place to start. These issues will have been triaged already by the Interface Team.
Once you’ve identified an issue that you want to pick up, you should:
  1. Comment on the issue expressing interest. A member of the Interface Team will assign it to you.
      <aside> 💡 In order to mitigate issues from becoming stale, we may reassign or un-assign an issue after an extended period of time if we see that no commits are occurring on it. We will reach out to the original assignee in these instances
      </aside>
  2. Fork the repo if you haven’t done so already.
  3. Create a branch for the issue by clicking Create a branch in the Development section on the Issue page. We follow Conventional Commits and follow the branch naming convention of [verb]/[issue number]-[branch name]. Some examples of branch names are:
      - fix/123-squashed-bug
      - feat/321-my-new-feature
  4. Please add a comment on the issue so other people know it is being worked on.
  5. Commit work using conventional commit formatting. There is a pre-commit hook with Husky that will enforce this. See the Running the UI Locally section for how to get the project running locally.
  6. Create a pull request by using the single PR template. Fill out the list of major changes that are happening in the codebase. These bullet points should be a high-level overview / at-a-glance of the major changes to ease reviews. Go over the `Author Checklist` items in the template, and ensure all of them have been met before opening for review.
  7. Code review. We might request you to make changes and iterate until we feel the code is ready.
  8. QA and design review. If anything comes up during testing, or if there are any UI/UX items that need to be addressed, we’ll let you know.
  9. Once there are two approvals, the Pull Request can be merged.

## Development Prerequisites

### Install Node

We are using a Next.js application, which relies on Node. You must have Node installed and set to use the specified version in `.nvmrc`. You can potentially use other versions, but we don’t recommend differing here.

You can download it from the [NodeJS website](https://nodejs.org/en/download/), but we recommend installing nvm and running the following command at root, after cloning or downloading the repo.

```bash
nvm use
```

### Install Dependencies

Download [Yarn Package Manager](https://yarnpkg.com/) and install the dependencies.

```bash
yarn install
```

### Setup Environment Variables

There are a few environment variables that we store for the interface. Before starting development, copy over the environment variables from the provided dummy file to a local copy.

```bash
cp .env.example .env.local
```

## Get Up & Running Locally

Once you’ve completed the prerequisites above, you should be able to start running the interface locally. There are several variations of running locally.

### Development Mode

Development builds are run with a watcher and an open server listening on `localhost:3000`.

```bash
yarn dev
```

### Production Mode

Production-based builds are great for usage on serverless & container-based hosting platforms like [Vercel](https://vercel.com) or [Heroku](https://heroku.com). To compile the source files into minified, production-ready asset bundles, run the build command.

```bash
yarn build
```

There is also the option to build the application for usages as a static site on platforms like IPFS, AWS, Vercel, etc. This essentially builds the application as above and additionally uses the `next export` command. More information around Next’s export command can be found [here](https://nextjs.org/docs/advanced-features/static-html-export).

```bash
yarn build:static
```

To start the server in production mode and use these bundled, minified assets, run the following command. This will start the web server listening on `localhost:3000`.

```bash
yarn start
```

You can also serve up the static site assets with the following command, which can be viewable on `localhost:3000`.

```bash
yarn serve:static
```

### Test Mode

The integration test suite runs against [Tenderly](https://tenderly.co/) forks of various networks. To setup the local environment, you’ll first need to create an account and obtain an access key. Then fill in the three environment variables accordingly:

```bash
TENDERLY_KEY=<your access key>
TENDERLY_ACCOUNT=<your account/organization name>
TENDERLY_PROJECT=<your project name>
```

For running the integration test suite, you’ll need to have the application running locally in a separate terminal. You may choose to either run it in development mode via `yarn dev` or against a static production build via `yarn build:static` & `yarn serve:static`. The caveat to running in development mode is that it will be more resource-intensive, since the application will be built on the fly.

```bash
# open interactive cypress test suite
yarn test:open

# run all tests in headless mode
yarn test:headless
```

## Environment Variables

Some environment variables can be adjusted to suit your needs during development, depending on the scenarios you want to test or build in.

```bash
# setting the environment to 'staging' will enable testnet markets, disabling governance, staking, and production markets
NEXT_PUBLIC_ENV=prod

# you can also disable staking & governance by altering
NEXT_PUBLIC_ENABLE_GOVERNANCE=true
NEXT_PUBLIC_ENABLE_STAKING=true
```

## Running Against a Chain Fork

You can run the UI locally against a forked chain network, similar to what the tests do with Tenderly. This will allow you to build and interact with the UI without spending actual funds. This is very useful for testing many protocol scenarios.

First, you’ll need to create a fork of a network, which can be done with a few different tools. We suggest using the one created by Bored Ghost Labs, where you can follow the steps and get set up [here](https://github.com/bgd-labs/aave-tenderly-cli).

Second, you’ll need to tell the local application which fork to run against. The easiest way to do this is to copy/paste the following statements. With the application running locally, open up the console in the browser and copy/paste the following with the appropriate values.

```js
localStorage.setItem('forkEnabled', 'true');
localStorage.setItem('forkBaseChainId', <chainId>); // the ID for the chain you are forking, in numeric format
localStorage.setItem('forkNetworkId', '3030'); // the ID of the new forked network
localStorage.setItem('forkRPCUrl', <rpcUrl>);
```

Since `localStorage` changes are not observed, _you’ll need to reload after setting the parameters_. After reloading, the market selection should show forked markets for all the markets that run on `forkBaseChainId`. To make actual transactions on the fork, you’ll need to setup your wallet to use the same `rpcUrl` you provided as `forkRPCUrl`. This will require you to setup your wallet by adding in the new fork network and connecting to the app with it.

If you are using MetaMask, make sure to configure the Tenderly fork RPC URL into a new network configuration. Give it a network name, and you'll want to use the same values that you copied into `localStorage` for the other fields. See below as an example:

![MetaMask Forked Network Setup](/public/fork-config-example.png)

Once you have both copied over the values into `localStorage` and have saved the new network configuration in MetaMask (or any other browser wallet), switch to the network in your wallet.

Next, reload the page. The new forked network should appear in the dropdown list for markets in the application.

Finally, switch to the market pertaining to the fork in the dropdown list. Now you are able to interact with the Aave Protocol via the UI without spending any real funds!

__NOTE:__ _Always double-check the selected network in your wallet provider to make sure transactions are executed only on the fork network_.


## Token Additions

To add a new token to the app, the process is pretty simple. All you’ll need to do is add a new token icon SVG to the `public/icons/tokens` directory. The only requirement is that the name of the SVG file is equal to the asset’s `symbol` in all lowercase. If you want a custom name to appear alongside the icon, you can alter `src/ui-config/reservePatches.ts` accordingly.

## Translations

Aave uses [Crowdin](https://crowdin.com/) for translation management and internationalization. We only update strings within the app. Everything else is downloaded from Crowdin. For more information, such as installing their CLI tool, read their [documentation](https://developer.crowdin.com/api/v2/).

To upload strings:

```bash
crowdin upload sources
```

To download strings:

```bash
crowdin download
```

If you would like to add support for a new language across the app, please [open up an issue](https://github.com/aave/interface/issues/new/choose) and add the `i18n` label to it. This helps us categorize, and it will also help to gauge public interest for the new language. If the community decides to go forward with your preferred language, you may open up a pull request. Please follow the template of [this PR](https://github.com/aave/interface/pull/447#issue-1165545965).

**Feel free to reach out to us on [Discord](https://discord.gg/aave) to become a translator!**
