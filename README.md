```
        .///.                .///.     //.            .//  `/////////////-
       `++:++`              .++:++`    :++`          `++:  `++:......---.`
      `/+: -+/`            `++- :+/`    /+/         `/+/   `++.
      /+/   :+/            /+:   /+/    `/+/        /+/`   `++.
  -::/++::`  /+:       -::/++::` `/+:    `++:      :++`    `++/:::::::::.
  -:+++::-`  `/+:      --++/---`  `++-    .++-    -++.     `++/:::::::::.
   -++.       .++-      -++`       .++.    .++.  .++-      `++.
  .++-         -++.    .++.         -++.    -++``++-       `++.
 `++:           :++`  .++-           :++`    :+//+:        `++:----------`
 -/:             :/-  -/:             :/.     ://:         `/////////////-
```

# Aave protocol interface :ghost:

An open source interface for the decentralized liquidity protocol Aave.

Enabling users to:

- Manage and monitor their positions on the Aave Protocol, and the overall status of it
- Manage and monitor their positions on the Aave Safety module
- Participate in the Aave Governance

## How to use

Install it and run:

```sh
cp .env.example .env.local
yarn
yarn dev
```

## Syncing this repository with `aave/interface`

This repository is based off of [aave/interface](https://github.com/aave/interface), but is kept private to guard GHO feature development from the general public until launch. Due to this scenario, it is important that this repository is kept up to date with the active changes happening on the `aave/interface` public repo. To get _this private repo_ up to date with _those public changes_, follow these steps:

1. Add a local upstream remote if you haven't already, and point it to the `aave/interface` repo. You'll only need to do this once, initially.

   `git remote add upstream https://github.com/aave/interface.git`

2. Doublecheck your local remotes with `git remote -v`. This should yield the following:

   ```sh
   origin      https://github.com/aave/interface-gho.git (fetch)
   origin      https://github.com/aave/interface-gho.git (push)
   upstream    https://github.com/aave/interface.git (fetch)
   upstream    https://github.com/aave/interface.git (push)
   ```

3.) Download all remote commits to your local repositories by running `git fetch --all`

4. Checkout `main` and ensure there are no pending changes and that your working tree is clean. Doublecheck with `git status`. It should yield the following:

   ```txt
   git checkout main
   git status

   On branch main
   Your branch is up to date with 'origin/main'.
   nothing to commit, working tree clean
   ```

5. Pull the latest version of the upstream interface repo into the `main` branch by setting the `HEAD` to that of the upstream remote.

   `git reset --hard upstream/main`

6. Now that your local `main` branch mirrors the latest from `aave/interface`, checkout the `chore/sync` branch. This is so we can prep the changes into a new PR.

   `git checkout chore/sync`

7. Merge in your local `main` into this branch. If there are conflicts, fix them locally and `add` then to the merge commit.

   `git merge main`

8. You should now have a pending commit to push up. Push it up to this private repo.

   `git push origin chore/sync`

9. Next, open up a new PR to merge `chore/sync` into `main` on the remote. This will ensure that we can vet the pending changes and not break anything in our GHO production app.

10. That's it! Once reviewed and merged in, ensure the `chore/sync` branch is not deleted so we can continue to use it in step 6 without issue. Then get latest on your local `main` branch again, which should ideally pull one new commit but not have any changes since you already pulled them in step 5.

    `git checkout main && git pull`

## Contribution

For instructions on local development, deployment, configurations & feature proposals, see [Contributing](./CONTRIBUTING.md)

Also, contributors with at least one pull request that has been merged into the main branch are eligible for a unique GitPOAP. Visit [gitpoap.io](https://www.gitpoap.io/gp/638) to claim it. 

<img src="https://www.gitpoap.io/_next/image?url=https%3A%2F%2Fassets.poap.xyz%2Fgitpoap3a-2022-aave-protocol-interface-contributor-2022-logo-1668012040505.png&w=2048&q=75" width="164">

## IPFS deployment

Each commit gets deployed to IPFS automatically

There's a github action commenting the appropriate IPFS hash embedded in the Cloudflare IPFS gateway after each commit

For ease of use:

- the DNS of [https://staging.aave.com](https://staging.aave.com) will always point to the latest main IPFS hash with all networks enabled
- the DNS of [https://app.aave.com](https://app.aave.com) will always point to the latest main IPFS hash with disabled test networks

### Links known to work at some point:

- [https://app-aave-com.ipns.cf-ipfs.com/#/](https://app-aave-com.ipns.cf-ipfs.com/#/)
- [https://app-aave-com.ipns.dweb.link/#/](https://app-aave-com.ipns.dweb.link/#/)

### Troubleshooting

Issue: I cannot connect to `app.aave.com`

The aave-ui is hosted on IPFS in a decentralized manner. `app.aave.com` just holds a CNAME record to the Cloudflare IPFS gateway. You can use [any](https://ipfs.github.io/public-gateway-checker/) public or private IPFS gateway supporting origin isolation to access aave-ui if for some reason the Cloudflare gateway doesn't work for you

Just go to `<your favorite public ipfs gateway>/ipns/app.aave.com`

⚠️ Make sure the gateway supports origin isolation to avoid possible security issues: you should be redirected to URL that looks like `https://app-aave-com.<your gateway>`

## License

[BSD-3-Clause](./LICENSE.md)

## Credits

To all the Ethereum community

