# Governance Module Architecture

## Overview

The governance module displays Aave DAO proposals — listing, searching, detail views, voting results, and lifecycle tracking.

**Data source:** a PostgreSQL-backed GraphQL server (the `governance-v3-cache` indexer), accessed through the **governance cache SDK** (`src/services/governance-cache-sdk`). The legacy TheGraph subgraph path has been **removed** — the cache is the sole source for proposal/vote/payload data. User-specific and protocol state (voting power, delegation, representatives, vote submission) is read **on-chain** via `@aave/contract-helpers`.

> Note: `NEXT_PUBLIC_USE_GOVERNANCE_CACHE` is no longer referenced in code (the cache is the only source). Only `NEXT_PUBLIC_GOVERNANCE_CACHE_URL` still matters — which cache server to hit.

## Data Flow

```
Pages / Components
        |
        v
  Governance hooks (useGovernanceCache.ts)
        |
        v
  Governance Cache SDK (services/governance-cache-sdk)
        |
        v
  Cache GraphQL server
        |
  Adapters (adapters.ts) --> Canonical display types (types.ts)

  User/protocol state (voting power, delegation, representatives, vote tx)
  is read on-chain via @aave/contract-helpers — separate hooks.
```

## Key Files

### Canonical Types — `types.ts`

Data-source-agnostic types consumed by all components:

| Type | Purpose |
|------|---------|
| `ProposalListItem` | List view: id, title, shortDescription, author, badgeState, voteInfo |
| `ProposalDetailDisplay` | Detail view: list fields + description, discussions, ipfsHash, `rawCacheDetail`, `voteProposalData` |
| `ProposalVoteDisplayInfo` | Vote stats: forVotes, againstVotes, forPercent (0-1), againstPercent (0-1), quorum, differential |
| `VoteDisplay` | Single voter: voter address, support, votingPower (normalized string), optional ensName |
| `VotersSplitDisplay` | Voters grouped: yaeVotes[], nayVotes[], combinedVotes[] |
| `VoteProposalData` | Vote UI inputs: proposalId, snapshotBlockHash, votingMachineChainId, votingAssets, votingState, votedInfo |

`ProposalDetailDisplay` carries `rawCacheDetail?` (raw cache `ProposalDetail`, used by `ProposalTimeline`) and `voteProposalData?` (built by `buildVoteProposalFromCache`, drives `VoteInfo`; `undefined` when the voting chain / snapshot hash can't be resolved).

### Governance Cache SDK — `src/services/governance-cache-sdk/`

Typed GraphQL fetching layer over the cache server. Public surface is the barrel `index.ts`:

| File | Responsibility |
|------|----------------|
| `client.ts` | Transport: `request<T>()`, `GovernanceCacheError`, endpoint (`NEXT_PUBLIC_GOVERNANCE_CACHE_URL`), re-exports `gql` |
| `types.ts` | Domain types: `SimplifiedProposal`, `ProposalDetail`, `ProposalVote`, `ProposalPayload`, `VoteCounts`, `ProposalVotingConfig`, `GovernanceConstants` |
| `proposals.ts` | `getProposals`, `searchProposals`, `getProposalById`, `getProposalDetail` |
| `votes.ts` | `getProposalVotes`, `getUserVote`, `getVoteCounts` |
| `payloads.ts` | `getProposalPayloads` |
| `config.ts` | `getProposalVotingConfig` (minPropositionPower etc., from `allVotingConfigUpdateds`), `resolveVotingChainId`, `GovernanceConstants` on-chain seam |

`src/services/GovernanceCacheService.ts` is a **deprecated back-compat shim** re-exporting the SDK under the legacy `*FromCache` names. Prefer importing from `src/services/governance-cache-sdk`.

### Adapters — `adapters.ts`

Convert raw cache types into canonical types:

| Function | From → To |
|----------|-----------|
| `adaptCacheProposalToListItem` | `SimplifiedProposal` → `ProposalListItem` |
| `adaptCacheProposalToDetail` | `ProposalDetail` → `ProposalDetailDisplay` (sets `rawCacheDetail`, `voteProposalData`) |
| `adaptCacheVote` | `ProposalVote` → `VoteDisplay` (normalizes votingPower from wei) |
| `buildVoteProposalFromCache` | `ProposalDetail` (+ user vote) → `VoteProposalData` for `VoteInfo` |
| `cacheStateToBadge` | state string → `ProposalBadgeState` |
| `calculateCacheVoteDisplayInfo` | raw vote strings → `ProposalVoteDisplayInfo` |

### Governance Hooks — `src/hooks/governance/useGovernanceCache.ts`

React Query layer over the SDK — the single hooks module components import from. Query keys come from `queryKeysFactory.governanceCache*` (`ui-config/queries.ts`). Shared internals: `CACHE_QUERY_OPTIONS`, `pagedNextParam`, `useEnsNames`.

| Hook | Returns |
|------|---------|
| `useGovernanceProposals()` | Infinite query of `{ proposals: ProposalListItem[] }` pages |
| `useGovernanceProposalsSearch(query)` | `{ results: ProposalListItem[], loading }` |
| `useGovernanceProposalDetail(proposalId)` | `useQuery` result with `ProposalDetailDisplay \| null` (includes the connected user's vote) |
| `useGovernanceVotersSplit(proposalId)` | `VotersSplitDisplay & { isFetching }` (ENS-resolved) |
| `useGovernanceProposalPayloads(proposalId, { enabled })` | `ProposalPayload[]` |
| `useProposalVotingConfig(accessLevel, { enabled })` | `ProposalVotingConfig \| null` (minPropositionPower etc.) |

`useGovernanceProposalPayloads` / `useProposalVotingConfig` accept an `{ enabled }` gate (e.g. payloads only fetch when `rawCacheDetail` exists).

### On-chain hooks (unchanged, not cache-backed)

`usePowers`, `useGovernanceTokens`, `useGovernanceTokensAndPowers`, `useDelegateeData`, `useRepresentatives`, `useTokensPower`, `useVotingPowerAt`, `usePayloadsData` — read from contracts via `@aave/contract-helpers`.

### Pages

| Page | File | Description |
|------|------|-------------|
| Proposals list | `pages/governance/index.governance.tsx` | Renders `<ProposalsV3List />` + `<UserGovernanceInfo />` |
| Proposal detail | `pages/governance/v3/proposal/index.governance.tsx` | Uses the public hooks; renders `VoteInfo` when `voteProposalData` exists, `ProposalTimeline` when `rawCacheDetail` exists, payloads via `useCacheProposalPayloads` gated on `rawCacheDetail` |
| IPFS preview | `pages/governance/ipfs-preview.governance.tsx` | Renders proposal from raw IPFS metadata |

### Components

| Component | File | Description |
|-----------|------|-------------|
| `ProposalsV3List` | `ProposalsV3List.tsx` | List with search and state filtering. Uses `useGovernanceProposals` + `useGovernanceProposalsSearch`. |
| `ProposalOverview` | `proposal/ProposalOverview.tsx` | Title, author, description (markdown), share buttons. |
| `VotingResults` | `proposal/VotingResults.tsx` | Vote bars, quorum, differential. Accepts `ProposalDetailDisplay` + `VotersSplitDisplay`. |
| `VotersListContainer` / `VotersListModal` / `VotersList` / `VotersListItem` | `proposal/Voters*.tsx` | Voter lists sorted by power, with ENS. |
| `VoteInfo` | `proposal/VoteInfo.tsx` | User's voting power + vote submission. Driven by `voteProposalData`. |
| `ProposalTimeline` | `proposal/ProposalTimeline.tsx` | Single-spine lifecycle timeline: dates, live countdowns, "ready to X" states, per-tx explorer links (cache + on-chain `cooldownPeriod`). |
| `VoteBar` | `VoteBar.tsx` | Percentage bar. `InnerBar` does `width: ${percent * 100}%`. **Expects 0-1 range.** |
| `StateBadge` | `StateBadge.tsx` | Colored badge + `ProposalBadgeState` enum and `stateToString`/`stringToState` helpers. |
| `VotingPowerInfoPanel` | `VotingPowerInfoPanel.tsx` | Voting/proposition power; proposal-creation thresholds via `useProposalVotingConfig`. |
| `DelegatedInfoPanel` / `RepresentativesInfoPanel` | `*.tsx` | Delegation + representatives (on-chain). |

## Critical Conventions

### Percentage Range: 0-1

`VoteBar` and `FormattedNumber` (with `percent`) expect **0-1**. Adapters normalize to 0-1.

### Vote Power Normalization

The cache stores votingPower in wei (18 decimals); `adaptCacheVote` normalizes it. Canonical `VoteDisplay.votingPower` is always a normalized (human-readable) string.

### Cache State Mapping

`cacheStateToBadge` maps cache state strings → `ProposalBadgeState`:

| Cache state | Badge |
|-------------|-------|
| `created` | Created |
| `active` | Open for voting |
| `queued` | Passed |
| `executed` | Executed |
| `failed` | Failed |
| `cancelled` | Cancelled |
| `expired` | Expired |
| `partially_executed` | Partially executed |

## Replacing the Subgraph (done)

The cache covers the high-volume data (proposals, votes, payloads). The fields the curated views don't expose:

- `minPropositionPower` — `getProposalVotingConfig` (auto-generated `allVotingConfigUpdateds`). ✅
- `votingMachineChainId` — `resolveVotingChainId` (derived from config). ✅
- `precisionDivider` / `cooldownPeriod` / `expirationTime` — GovernanceCore immutables, read on-chain via `GovernanceV3Service` (the `GovernanceConstants` seam in `config.ts`). Not currently consumed by the UI.

## File Tree

```
src/services/governance-cache-sdk/
  client.ts                          # transport (request, GovernanceCacheError, endpoint, gql)
  types.ts                           # domain types
  proposals.ts                       # list / search / byId / detail
  votes.ts                           # votes / user vote / counts
  payloads.ts                        # proposal payloads
  config.ts                          # voting config, chain id, constants seam
  index.ts                           # public surface
src/services/
  GovernanceCacheService.ts          # @deprecated back-compat shim → governance-cache-sdk

src/modules/governance/
  Architecture.md                    # This file
  types.ts                           # Canonical display types
  adapters.ts                        # Cache → canonical transforms
  ProposalsV3List.tsx                # Proposals list + search
  StateBadge.tsx                     # State badge component + enum + state-string helpers
  VoteBar.tsx                        # Vote percentage bar (expects 0-1)
  GovernanceTopPanel.tsx             # Top panel layout
  ProposalListHeader.tsx             # List header with filter tabs
  FormattedProposalTime.tsx          # Time formatting
  DelegatedInfoPanel.tsx             # Delegation display
  RepresentativesInfoPanel.tsx       # Representatives display
  UserGovernanceInfo.tsx             # User governance info
  VotingPowerInfoPanel.tsx           # Voting/proposition power + creation thresholds
  proposal/
    ProposalOverview.tsx             # Proposal detail: title, description, markdown
    VotingResults.tsx                # Vote bars, quorum, differential
    VotersListContainer.tsx          # Top-10 voters + modal trigger
    VotersListModal.tsx              # Full voters modal (YAE/NAY)
    VotersList.tsx                   # Scrollable voter list
    VotersListItem.tsx               # Single voter row
    VoteInfo.tsx                     # User vote UI (via voteProposalData)
    ProposalTimeline.tsx             # Single-spine lifecycle timeline
    ProposalTopPanel.tsx             # Detail page top panel
  utils/
    formatProposal.ts                # ZERO_ADDRESS constant (shared)
    getProposalMetadata.ts           # IPFS metadata fetch

src/hooks/governance/
  useGovernanceCache.ts              # Governance data hooks (SDK-backed)
  useGovernanceTokens.ts             # Governance token balances (on-chain)
  useGovernanceTokensAndPowers.ts    # Token balances + voting power (on-chain)
  useDelegateeData.ts                # Delegation data (on-chain)
  usePayloadsData.ts                 # Payload execution data (on-chain)
  usePowers.ts                       # Voting/proposition power (on-chain)
  useRepresentatives.ts              # Representative addresses (on-chain)
  useTokensPower.ts                  # Token power calculations (on-chain)
  useVotingPowerAt.ts                # Historical voting power (on-chain)

pages/governance/
  index.governance.tsx               # Proposals list page
  ipfs-preview.governance.tsx        # IPFS metadata preview
  v3/proposal/index.governance.tsx   # Proposal detail page
```
```
