# CLAUDE.md - Context Guide for Aave Interface

## Project Overview

- **Framework**: Next.js (Pages Router) with React
- **Package Manager**: Yarn
- **Styling**: Emotion (CSS-in-JS)
- **State Management**: Redux (via `src/store/`)
- **i18n**: Lingui
- **Purpose**: DeFi interface for Aave protocol (V2/V3)

## Key File Paths

```
src/
├── components/          # Shared UI components
├── hooks/               # Custom React hooks
│   ├── app-data-provider/
│   ├── paraswap/        # DEX aggregation hooks
│   └── pool/            # Aave pool interaction hooks
├── layouts/             # Page layouts
├── modules/             # Feature modules
├── services/            # API/service integrations
├── store/               # Redux store
├── helpers/             # Utility helpers
├── libs/                # Library wrappers
└── ui-config/           # Protocol UI configuration
```

## Development Commands

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn lint` - Run linting (ESLint + Prettier)
- `yarn lint:fix` - Auto-fix lint issues

## Debugging Transactions & Simulations

When debugging a failed on-chain transaction or Tenderly simulation:
1. Use the `tenderly_simulate.sh` script from the [aave-backend repo](https://github.com/aave/aave-backend/blob/main/scripts/tenderly_simulate.sh) to reproduce and get a decoded call trace:
   ```bash
   # Live network at latest block
   ./tenderly_simulate.sh --network <chain_id> <from> <to> <calldata>
   # Pin to a specific block (critical for reproducing historical failures)
   ./tenderly_simulate.sh --network <chain_id> --block <block_number> <from> <to> <calldata>
   ```
2. The script output includes LLM-friendly diagnostics:
   - **Block timestamp** in the header — compare against any `deadline`/`validTo` params
   - **Timestamp annotations** — params named `deadline`, `validTo`, `expiry` etc. are auto-annotated with human-readable dates and `!! EXPIRED !!` warnings
   - **Revert chain summary** — innermost-first list of all reverted calls with contract names; the innermost revert (`>>>`) is usually the root cause
   - **Address directory** — maps all addresses in the trace to contract names
3. To get calldata from an existing Tenderly simulation, use the API:
   ```bash
   curl -s -H "X-Access-Key: $TENDERLY_ACCESS_KEY" \
     "https://api.tenderly.co/api/v1/account/$TENDERLY_ACCOUNT_SLUG/project/$TENDERLY_PROJECT_SLUG/simulations/<sim_id>" \
     | jq -r '.simulation.input'
   ```
4. For CoW Protocol orders, get order details from `https://api.cow.fi/<network>/api/v1/orders/<order_uid>`
