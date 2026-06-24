# Governance Module Architecture

## Overview

The governance module displays Aave DAO proposals — listing, searching, detail views, voting results, and lifecycle tracking. It supports **two data sources** toggled by the env var `NEXT_PUBLIC_USE_GOVERNANCE_CACHE`:

- **Graph path** (`false` / unset): Fetches from Aave's governance subgraph + on-chain contracts via `@aave/contract-helpers`. The original data source.
- **Cache path** (`true`): Fetches from a PostgreSQL-backed GraphQL server (the `governance-v3-cache` indexer) through the **governance cache SDK** (`src/services/governance-cache-sdk`). Faster, no subgraph dependency.

Components never check the env var. The decision is pushed into **unified hooks** (`useGovernanceProposals.ts`) that internally run both react-query calls (to satisfy React hook ordering rules) but only `enabled` one at runtime. The cache branch of each unified hook delegates to the cache hooks layer (`useGovernanceCache.ts`).

## Data Flow

```
Pages / Components
        |
        v
  Unified Hooks (useGovernanceProposals.ts)
        |
        +-- [env: cache] --> Cache Hooks (useGovernanceCache.ts)
        |                          |
        |                     Governance Cache SDK (services/governance-cache-sdk)
        |                          |
        |                     Cache GraphQL server
        |
        +-- [env: graph] --> Graph Hooks (useProposals.ts, useProposal.ts)
                                   |
                             subgraph + on-chain contracts

  Both paths --> Adapter functions (adapters.ts) --> Canonical display types (types.ts)
```

## Key Files

### Canonical Types — `types.ts`

All components consume these data-source-agnostic types:

| Type | Purpose |
|------|---------|
| `ProposalListItem` | List view: id, title, shortDescription, author, badgeState, voteInfo |
| `ProposalDetailDisplay` | Detail view: extends list fields with description, discussions, ipfsHash, plus escape hatches |
| `ProposalVoteDisplayInfo` | Vote stats: forVotes, againstVotes, forPercent (0-1), againstPercent (0-1), quorum, differential |
| `VoteDisplay` | Single voter: voter address, support boolean, votingPower (normalized string, not wei), optional ensName |
| `VotersSplitDisplay` | Voters grouped: yaeVotes[], nayVotes[], combinedVotes[] |
| `VoteProposalData` | Everything the vote UI needs: proposalId, snapshotBlockHash, votingMachineChainId, votingAssets, votingState, votedInfo |

**Important:** `ProposalDetailDisplay` has three optional fields the detail page discriminates on:
- `rawProposal?: Proposal` — present only on the graph path. Used by `ProposalLifecycle`.
- `rawCacheDetail?: ProposalDetail` — present only on the cache path. Used by `ProposalLifecycleCache`.
- `voteProposalData?: VoteProposalData` — built by **both** paths (graph via `buildVoteProposalFromGraph`, cache via `buildVoteProposalFromCache`). Drives `VoteInfo`. On the cache path it is `undefined` when the voting chain / snapshot hash can't be resolved.

### Governance Cache SDK — `src/services/governance-cache-sdk/`

Typed GraphQL fetching layer over the cache server (curated endpoints + the auto-generated / derived fields needed to fully replace the subgraph). The public surface is the barrel `index.ts`:

| File | Responsibility |
|------|----------------|
| `client.ts` | Transport: `request<T>()` raw-fetch wrapper, `GovernanceCacheError`, endpoint (`NEXT_PUBLIC_GOVERNANCE_CACHE_URL`), re-exports `gql` |
| `types.ts` | Domain types: `SimplifiedProposal`, `ProposalDetail`, `ProposalVote`, `ProposalPayload`, `VoteCounts`, `ProposalVotingConfig`, `GovernanceConstants` |
| `proposals.ts` | `getProposals`, `searchProposals`, `getProposalById`, `getProposalDetail` |
| `votes.ts` | `getProposalVotes`, `getUserVote`, `getVoteCounts` |
| `payloads.ts` | `getProposalPayloads` |
| `config.ts` | Gap closers — see below |

**Gap closers** (`config.ts`) — the data the curated views drop but is needed to retire the subgraph:
- `getProposalVotingConfig(accessLevel)` — latest voting config from the auto-generated `allVotingConfigUpdateds` table; exposes `minPropositionPower` (which `proposals_view` omits).
- `resolveVotingChainId(votingMachineAddress)` — derives the voting chain id from config; replaces the subgraph's `votingPortal.votingMachineChainId`. No fetch.
- `GovernanceConstants` — type + documented on-chain seam for `precisionDivider` / `cooldownPeriod` / `expirationTime` (GovernanceCore immutables that are **not** indexed and must be read on-chain).

`src/services/GovernanceCacheService.ts` is a **deprecated back-compat shim** that re-exports the SDK under the legacy `*FromCache` names. Prefer importing from `src/services/governance-cache-sdk`.

### Adapters — `adapters.ts`

Transform functions that convert raw data source types into canonical types:

| Function | From → To |
|----------|-----------|
| `adaptGraphProposalToListItem` | `Proposal` → `ProposalListItem` |
| `adaptGraphProposalToDetail` | `Proposal` → `ProposalDetailDisplay` (sets `rawProposal`, `voteProposalData`) |
| `adaptCacheProposalToListItem` | `SimplifiedProposal` → `ProposalListItem` |
| `adaptCacheProposalToDetail` | `ProposalDetail` → `ProposalDetailDisplay` (sets `rawCacheDetail`, `voteProposalData`) |
| `adaptCacheVote` | `ProposalVote` → `VoteDisplay` (normalizes votingPower from wei) |
| `buildVoteProposalFromGraph` / `buildVoteProposalFromCache` | build `VoteProposalData` for `VoteInfo` |
| `cacheStateToBadge` | state string → `ProposalBadgeState` enum |
| `calculateCacheVoteDisplayInfo` | raw vote strings → `ProposalVoteDisplayInfo` |

### Cache Hooks — `src/hooks/governance/useGovernanceCache.ts`

React Query layer over the SDK. Cache-only; each hook takes a `{ enabled }` option so unified hooks can gate it. Query keys come from `queryKeysFactory.governanceCache*` in `ui-config/queries.ts`. Shared internals: `CACHE_QUERY_OPTIONS`, `pagedNextParam`, `useEnsNames`.

| Hook | Returns |
|------|---------|
| `useCacheProposalsList({ enabled })` | Infinite query of `{ proposals: ProposalListItem[] }` pages |
| `useCacheProposalsSearch(query, { enabled })` | `ProposalListItem[]` |
| `useCacheProposalDetail(proposalId, { enabled })` | `ProposalDetailDisplay \| null` (includes the connected user's vote) |
| `useCacheVotersSplit(proposalId, { enabled })` | `VotersSplitDisplay & { isFetching }` (ENS-resolved) |
| `useCacheProposalPayloads(proposalId, { enabled })` | `ProposalPayload[]` |
| `useProposalVotingConfig(accessLevel, { enabled })` | `ProposalVotingConfig \| null` (gap closer; not yet wired into UI) |

### Unified Hooks — `src/hooks/governance/useGovernanceProposals.ts`

The main entry point for components. Each declares both a cache and a graph query and returns the enabled one.

| Hook | Returns | Notes |
|------|---------|-------|
| `useGovernanceProposals()` | Infinite query of `ProposalListItem[]` pages | Cache branch → `useCacheProposalsList`; graph branch inline. PAGE_SIZE=10 |
| `useGovernanceProposalsSearch(query)` | `{ results: ProposalListItem[], loading }` | Cache branch → `useCacheProposalsSearch`; graph uses subgraph full-text search |
| `useGovernanceProposalDetail(proposalId)` | `useQuery` result with `ProposalDetailDisplay \| null` | Cache branch → `useCacheProposalDetail` |
| `useGovernanceVotersSplit(proposalId, votingChainId?)` | `VotersSplitDisplay & { isFetching }` | Cache branch → `useCacheVotersSplit`; graph path resolves ENS inline |

Also re-exports `ENS_REVERSE_REGISTRAR` (consumed by the graph-path `useProposalVotes.ts`).

### Graph-Path Internal Hooks (still used by unified hooks)

- `src/hooks/governance/useProposals.ts` — exports `getProposals`, `fetchProposals`, `fetchSubgraphProposalsByIds`, `getSubgraphProposalMetadata`. Fetches from governance subgraph + voting machine + payloads contracts.
- `src/hooks/governance/useProposal.ts` — exports `getProposal`. Fetches a single proposal from the subgraph.

### Pages

| Page | File | Description |
|------|------|-------------|
| Proposals list | `pages/governance/index.governance.tsx` | Renders `<ProposalsV3List />` |
| Proposal detail | `pages/governance/v3/proposal/index.governance.tsx` | Uses unified hooks; renders `VoteInfo` when `voteProposalData` exists; lifecycle discriminated by `rawProposal` / `rawCacheDetail`; payloads via `useCacheProposalPayloads` gated on `rawCacheDetail` |
| IPFS preview | `pages/governance/ipfs-preview.governance.tsx` | Renders proposal from raw IPFS metadata |

### Components

| Component | File | Description |
|-----------|------|-------------|
| `ProposalsV3List` | `ProposalsV3List.tsx` | Proposals list with search and state filtering. Uses `useGovernanceProposals` and `useGovernanceProposalsSearch`. |
| `ProposalOverview` | `proposal/ProposalOverview.tsx` | Proposal title, author, description (markdown), share buttons. Accepts `ProposalDetailDisplay`. |
| `VotingResults` | `proposal/VotingResults.tsx` | Vote bars, quorum, differential display. Accepts `ProposalDetailDisplay` + `VotersSplitDisplay`. |
| `VotersListContainer` | `proposal/VotersListContainer.tsx` | Top-10 voters + "View all" modal trigger. |
| `VotersListModal` | `proposal/VotersListModal.tsx` | Full voters modal split by YAE/NAY. |
| `VotersList` / `VotersListItem` | `proposal/VotersList*.tsx` | Voter list sorted by power; row with address, ENS name, voting power. |
| `VoteInfo` | `proposal/VoteInfo.tsx` | User's voting power and vote submission. Driven by `voteProposalData` — works on **both** paths. |
| `ProposalLifecycle` | `proposal/ProposalLifecycle.tsx` | Lifecycle timeline with explorer links. **Graph path only** (needs `rawProposal`). |
| `ProposalLifecycleCache` | `proposal/ProposalLifecycleCache.tsx` | Lifecycle timeline from cache timestamps + payloads. **Cache path only** (needs `rawCacheDetail`). |
| `VoteBar` | `VoteBar.tsx` | Percentage bar. `InnerBar` does `width: ${percent * 100}%`. **Expects 0-1 range.** |
| `StateBadge` | `StateBadge.tsx` | Colored badge for proposal state. Exports `ProposalBadgeState` enum and `lifecycleToBadge`. |

### Utilities

- `utils/formatProposal.ts` — `getLifecycleState()`, `getProposalVoteInfo()`, `ProposalLifecycleStep` enum. Used by the graph path for lifecycle and vote calculations.
- `utils/getProposalMetadata.ts` — IPFS metadata fetching.
- `helpers.ts` — `isProposalStateImmutable()` helper.

## Critical Conventions

### Percentage Range: 0-1

Both `VoteBar` and `FormattedNumber` (with `percent` prop) expect values in **0-1 range**:

- `VoteBar`'s `InnerBar`: `width: ${percent * 100}%`
- `FormattedNumber`: internally does `Number(value) * 100` when `percent` is true

The adapter functions in `adapters.ts` normalize both data sources to 0-1. If you're adding new percentage displays, always use 0-1.

### Vote Power Normalization

- **Graph path**: Subgraph returns votingPower in wei (18 decimals). `normalizeBN(votingPower, 18)` converts to human-readable.
- **Cache path**: Cache stores votingPower in wei. `adaptCacheVote` normalizes from 18 decimals.
- The canonical `VoteDisplay.votingPower` is always a normalized string (human-readable, not wei).

### Cache State Mapping

Cache stores proposal state as lowercase strings. `cacheStateToBadge` in `adapters.ts` maps them:

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

### Hook Pattern: Dual Queries, Single Enabled

In `useGovernanceProposals.ts`, both the cache and graph react-query calls are always declared (React requires a stable hook call order). The cache call delegates to a `useGovernanceCache.ts` hook with `{ enabled: USE_GOVERNANCE_CACHE }`; the graph call is inline with `enabled: !USE_GOVERNANCE_CACHE`. Only one fires:

```ts
const cacheResult = useCacheProposalsList({ enabled: USE_GOVERNANCE_CACHE });
const graphResult = useInfiniteQuery({ ..., enabled: !USE_GOVERNANCE_CACHE });
return USE_GOVERNANCE_CACHE ? cacheResult : graphResult;
```

### Escape Hatches for Path-Specific Components

Some components are fundamentally different between data sources, so the detail page discriminates rather than force-merging:

```tsx
{proposal?.voteProposalData && <VoteInfo voteData={proposal.voteProposalData} />}
{proposal?.rawProposal ? (
  <ProposalLifecycle proposal={proposal.rawProposal} />
) : proposal?.rawCacheDetail ? (
  <ProposalLifecycleCache proposal={proposal.rawCacheDetail} payloads={payloads} />
) : null}
```

## Replacing the Subgraph

The cache covers the high-volume data (proposals, votes, payloads). The remaining gaps and how they're sourced:

- `minPropositionPower` — `getProposalVotingConfig` (auto-generated cache table). ✅ available
- `votingMachineChainId` — `resolveVotingChainId` (derived from config). ✅ available
- `precisionDivider` / `cooldownPeriod` / `expirationTime` — GovernanceCore immutables, **not** in the cache; read on-chain via `GovernanceV3Service` and cache once (the `GovernanceConstants` seam in `config.ts`).

## File Tree

```
src/services/governance-cache-sdk/
  client.ts                          # transport (request, GovernanceCacheError, endpoint, gql)
  types.ts                           # domain types
  proposals.ts                       # list / search / byId / detail
  votes.ts                           # votes / user vote / counts
  payloads.ts                        # proposal payloads
  config.ts                          # gap closers (voting config, chain id, constants seam)
  index.ts                           # public surface
src/services/
  GovernanceCacheService.ts          # @deprecated back-compat shim → governance-cache-sdk

src/modules/governance/
  Architecture.md                    # This file
  types.ts                           # Canonical display types
  adapters.ts                        # Data source → canonical transforms
  ProposalsV3List.tsx                # Proposals list + search (unified)
  StateBadge.tsx                     # State badge component + enum
  VoteBar.tsx                        # Vote percentage bar (expects 0-1)
  helpers.ts                         # isProposalStateImmutable
  GovernanceTopPanel.tsx             # Top panel layout
  ProposalListHeader.tsx             # List header with filter tabs
  FormattedProposalTime.tsx          # Time formatting
  DelegatedInfoPanel.tsx             # Delegation display
  RepresentativesInfoPanel.tsx       # Representatives display
  UserGovernanceInfo.tsx             # User governance info
  VotingPowerInfoPanel.tsx           # Voting power display
  proposal/
    ProposalOverview.tsx             # Proposal detail: title, description, markdown
    VotingResults.tsx                # Vote bars, quorum, differential
    VotersListContainer.tsx          # Top-10 voters + modal trigger
    VotersListModal.tsx              # Full voters modal (YAE/NAY)
    VotersList.tsx                   # Scrollable voter list
    VotersListItem.tsx               # Single voter row
    VoteInfo.tsx                     # User vote UI (both paths, via voteProposalData)
    ProposalLifecycle.tsx            # Lifecycle timeline (graph path only)
    ProposalLifecycleCache.tsx       # Lifecycle timeline (cache path only)
    ProposalTopPanel.tsx             # Detail page top panel
  utils/
    formatProposal.ts                # Lifecycle state machine, vote info calculation
    getProposalMetadata.ts           # IPFS metadata fetch

src/hooks/governance/
  useGovernanceProposals.ts          # UNIFIED HOOKS (main entry point for data)
  useGovernanceCache.ts              # Cache hooks layer (SDK-backed)
  useProposals.ts                    # Graph: subgraph proposal fetching
  useProposal.ts                     # Graph: single proposal fetch
  useProposalVotes.ts                # Graph: vote fetching (legacy)
  useProposalsSearch.ts              # Graph: search (legacy)
  useDelegateeData.ts                # Delegation data
  useGovernanceTokens.ts             # Governance token balances
  useGovernanceTokensAndPowers.ts    # Token balances + voting power
  usePayloadsData.ts                 # Payload execution data
  usePowers.ts                       # Voting/proposition power
  useRepresentatives.ts              # Representative addresses
  useTokensPower.ts                  # Token power calculations
  useVotingPowerAt.ts                # Historical voting power

pages/governance/
  index.governance.tsx               # Proposals list page
  ipfs-preview.governance.tsx        # IPFS metadata preview
  v3/proposal/index.governance.tsx   # Proposal detail page
```
