# ConnectKit 1.9.2

`connectkit@1.9.2.patch` retains the existing invalid-ENS-name normalization guard
and adds the Oath catalog support proposed in
[family/connectkit#527](https://github.com/family/connectkit/pull/527)
(source commit `7f724d3`). The JavaScript changes are generated from that source
with the existing production Rollup configuration; the wallet-config declaration
adds the optional `walletConnectOnly` flag.

The entry reuses Aave's existing WalletConnect connector and negotiated session.
It does not add an injected provider, chains, permissions, or another relay
connection. The main list offers Oath directly, with a rounded logo and a QR
screen on desktop. iOS uses `oathwallet://wc?uri=...` once a pairing URI is ready.
Android keeps the main entry's QR flow for a separate iOS device and does not
offer an unsupported same-device handoff in the secondary mobile directory.

When upgrading to a ConnectKit release containing the upstream change, remove
the Oath hunks from the patch. Retain the ENS guard unless that release fixes it
too. Regenerate the patch and lockfile with `pnpm patch` / `pnpm patch-commit`.

Run `pnpm test:oath-wallet` on the repository's required Node 24 version. The
tests exercise the actual patched connector and production configuration helper,
including ordering, preserving the canonical WalletConnect and Safe factories,
no-WalletConnect fallback, and duplicate prevention. They do not pair a physical
phone or sign transactions.
