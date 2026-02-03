# Governance Module Architecture

## Overview

The governance module displays Aave DAO proposals — listing, searching, detail views, voting results, and lifecycle tracking. It supports **two data sources** toggled by the env var `NEXT_PUBLIC_USE_GOVERNANCE_CACHE`:

- **Graph path** (`false` / unset): Fetches from Aave's governance subgraph + on-chain contracts via `@aave/contract-helpers`. This is the original data source.
- **Cache path** (`true`): Fetches from a local PostgreSQL-backed GraphQL server (`GovernanceCacheService.ts`). Faster, no subgraph dependency.

Components never check the env var. The decision is pushed into **unified hooks** that internally run both react-query calls (to satisfy React hook ordering rules) but only `enabled` one at runtime.

## Data Flow

```
Pages / Components
        |
        v
  Unified Hooks (useGovernanceProposals.ts)
        |
        +--> [env var check] --> Graph hooks (useProposals.ts, useProposal.ts)
        |                              |
        |                        Adapter functions (adapters.ts)
        |                              |
        |                        Canonical display types (types.ts)
        |
        +--> [env var check] --> Cache service (GovernanceCacheService.ts)
                                       |
                                 Adapter functions (adapters.ts)
                                       |
                                 Canonical display types (types.ts)
```

## Key Files

### Canonical Types — `types.ts`

All components consume these data-source-agnostic types:

| Type | Purpose |
|------|---------|
| `ProposalListItem` | List view: id, title, shortDescription, author, badgeState, voteInfo |
| `ProposalDetailDisplay` | Detail view: extends list fields with description, discussions, ipfsHash, plus escape hatches |
| `ProposalVoteDisplayInfo` | Vote stats: forVotes, againstVotes, forPercent (0-1), againstPercent (0-1), quorum, differential |
| `VoteDisplay` | Single voter: voter address, support boolean, votingPower (normalized string, not wei) |
| `VotersSplitDisplay` | Voters grouped: yaeVotes[], nayVotes[], combinedVotes[] |

**Important:** `ProposalDetailDisplay` has two optional escape-hatch fields:
- `rawProposal?: Proposal` — present only on the graph path. Used by `VoteInfo` and `ProposalLifecycle` which need raw on-chain data.
- `rawCacheDetail?: ProposalDetail` — present only on the cache path. Used by `ProposalLifecycleCache` which needs cache timestamps.

### Adapters — `adapters.ts`

Transform functions that convert raw data source types into canonical types:

| Function | From → To |
|----------|-----------|
| `adaptGraphProposalToListItem` | `Proposal` → `ProposalListItem` |
| `adaptGraphProposalToDetail` | `Proposal` → `ProposalDetailDisplay` (sets `rawProposal`) |
| `adaptCacheProposalToListItem` | `SimplifiedProposal` → `ProposalListItem` |
| `adaptCacheProposalToDetail` | `ProposalDetail` → `ProposalDetailDisplay` (sets `rawCacheDetail`) |
| `adaptCacheVote` | `ProposalVote` → `VoteDisplay` (divides votingPower by 1e18) |
| `cacheStateToBadge` | state string → `ProposalBadgeState` enum |
| `calculateCacheVoteDisplayInfo` | raw vote strings → `ProposalVoteDisplayInfo` |

### Unified Hooks — `src/hooks/governance/useGovernanceProposals.ts`

| Hook | Returns | Notes |
|------|---------|-------|
| `useGovernanceProposals()` | Infinite query of `ProposalListItem[]` pages | Paginated, PAGE_SIZE=10 |
| `useGovernanceProposalsSearch(query)` | `{ results: ProposalListItem[], loading }` | Graph uses subgraph full-text search; cache uses `searchProposalsFromCache` |
| `useGovernanceProposalDetail(proposalId)` | `useQuery` result with `ProposalDetailDisplay \| null` | Cache can return `null` if proposal not found |
| `useGovernanceVotersSplit(proposalId, votingChainId?)` | `VotersSplitDisplay & { isFetching }` | Graph path also resolves ENS names |

### Cache Service — `src/services/GovernanceCacheService.ts`

Raw GraphQL client for the governance cache server (endpoint: `NEXT_PUBLIC_GOVERNANCE_CACHE_URL`).

Key types:
- `SimplifiedProposal` — list-level proposal data
- `ProposalDetail` — full detail including timestamps, quorum, requiredDifferential
- `ProposalVote` — voter, support, votingPower (in wei/18 decimals), votingNetwork
- `ProposalPayload` — payload execution data (used by `ProposalLifecycleCache`)

Key functions:
- `getProposalsFromCache(limit, offset, stateFilter?)` — paginated list
- `searchProposalsFromCache(query, limit)` — full-text search
- `getProposalDetailFromCache(id)` — single proposal with timestamps and thresholds
- `getProposalVotesFromCache(id, support?, limit, offset)` — paginated votes
- `getProposalPayloadsFromCache(id)` — payload data for lifecycle display

### Graph-Path Internal Hooks (still used by unified hooks)

- `src/hooks/governance/useProposals.ts` — exports `getProposals`, `fetchProposals`, `fetchSubgraphProposalsByIds`, `getSubgraphProposalMetadata`. Fetches from governance subgraph + voting machine + payloads contracts.
- `src/hooks/governance/useProposal.ts` — exports `getProposal`. Fetches single proposal from subgraph.
- `src/hooks/governance/useProposalDetailCache.ts` — used internally by `ProposalLifecycleCache` for payload data. Not part of the unified hook layer.

### Pages

| Page | File | Description |
|------|------|-------------|
| Proposals list | `pages/governance/index.governance.tsx` | Renders `<ProposalsV3List />` |
| Proposal detail | `pages/governance/v3/proposal/index.governance.tsx` | Uses unified hooks, conditionally renders VoteInfo (graph only) and Lifecycle (discriminated by rawProposal/rawCacheDetail) |
| IPFS preview | `pages/governance/ipfs-preview.governance.tsx` | Renders proposal from raw IPFS metadata |

### Components

| Component | File | Description |
|-----------|------|-------------|
| `ProposalsV3List` | `ProposalsV3List.tsx` | Proposals list with search and state filtering. Uses `useGovernanceProposals` and `useGovernanceProposalsSearch`. |
| `ProposalOverview` | `proposal/ProposalOverview.tsx` | Proposal title, author, description (markdown), share buttons. Accepts `ProposalDetailDisplay`. |
| `VotingResults` | `proposal/VotingResults.tsx` | Vote bars, quorum, differential display. Accepts `ProposalDetailDisplay` + `VotersSplitDisplay`. |
| `VotersListContainer` | `proposal/VotersListContainer.tsx` | Top-10 voters + "View all" modal trigger. |
| `VotersListModal` | `proposal/VotersListModal.tsx` | Full voters modal split by YAE/NAY. |
| `VotersList` | `proposal/VotersList.tsx` | Scrollable voter list sorted by voting power. |
| `VotersListItem` | `proposal/VotersListItem.tsx` | Single voter row with address, ENS name, voting power. |
| `VoteInfo` | `proposal/VoteInfo.tsx` | User's voting power and vote submission. **Graph path only** (needs `rawProposal`). |
| `ProposalLifecycle` | `proposal/ProposalLifecycle.tsx` | Timeline with explorer links, complex state machine. **Graph path only** (needs `rawProposal`). |
| `ProposalLifecycleCache` | `proposal/ProposalLifecycleCache.tsx` | Simplified timeline from cache timestamps. **Cache path only** (needs `rawCacheDetail`). |
| `VoteBar` | `VoteBar.tsx` | Percentage bar. `InnerBar` does `width: ${percent * 100}%`. **Expects 0-1 range.** |
| `StateBadge` | `StateBadge.tsx` | Colored badge for proposal state. Exports `ProposalBadgeState` enum and `lifecycleToBadge`. |

### Utilities

- `utils/formatProposal.ts` — `getLifecycleState()`, `getProposalVoteInfo()`, `ProposalLifecycleStep` enum. Used by graph path for lifecycle and vote calculations.
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
- **Cache path**: Cache stores votingPower in wei. `adaptCacheVote` divides by `1e18`.
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

### Hook Pattern: Dual Queries, Single Enabled

In `useGovernanceProposals.ts`, both graph and cache react-query calls are always declared (React requires stable hook call order). The `enabled` flag ensures only one actually fires:

```ts
const cacheResult = useInfiniteQuery({ ..., enabled: USE_GOVERNANCE_CACHE });
const graphResult = useInfiniteQuery({ ..., enabled: !USE_GOVERNANCE_CACHE });
return USE_GOVERNANCE_CACHE ? cacheResult : graphResult;
```

### Escape Hatches for Path-Specific Components

Some components are fundamentally different between data sources:

- `VoteInfo` needs `Proposal` (on-chain voting machine data, user's voting power) — only available on graph path.
- `ProposalLifecycle` needs `Proposal` (explorer links, complex state machine with payloads data).
- `ProposalLifecycleCache` needs `ProposalDetail` (simple timestamps from cache).

Rather than force-merging these, the detail page discriminates:

```tsx
{proposal?.rawProposal && <VoteInfo proposal={proposal.rawProposal} />}
{proposal?.rawProposal ? (
  <ProposalLifecycle proposal={proposal.rawProposal} />
) : proposal?.rawCacheDetail ? (
  <ProposalLifecycleCache proposal={proposal.rawCacheDetail} />
) : null}
```

## File Tree

```
src/modules/governance/
  CLAUDE.md                          # This file
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
    VoteInfo.tsx                     # User vote UI (graph path only)
    ProposalLifecycle.tsx            # Lifecycle timeline (graph path only)
    ProposalLifecycleCache.tsx       # Lifecycle timeline (cache path only)
    ProposalTopPanel.tsx             # Detail page top panel
  utils/
    formatProposal.ts               # Lifecycle state machine, vote info calculation
    getProposalMetadata.ts           # IPFS metadata fetch

src/hooks/governance/
  useGovernanceProposals.ts          # UNIFIED HOOKS (main entry point for data)
  useProposals.ts                    # Graph: subgraph proposal fetching
  useProposal.ts                     # Graph: single proposal fetch
  useProposalVotes.ts                # Graph: vote fetching (legacy, unused by components)
  useProposalsSearch.ts              # Graph: search (legacy, unused by components)
  useProposalDetailCache.ts          # Cache: payload data for ProposalLifecycleCache
  useDelegateeData.ts                # Delegation data
  useGovernanceTokens.ts             # Governance token balances
  useGovernanceTokensAndPowers.ts    # Token balances + voting power
  usePayloadsData.ts                 # Payload execution data
  usePowers.ts                       # Voting/proposition power
  useRepresentatives.ts              # Representative addresses
  useTokensPower.ts                  # Token power calculations
  useVotingPowerAt.ts                # Historical voting power

src/services/
  GovernanceCacheService.ts          # GraphQL client for cache server

pages/governance/
  index.governance.tsx               # Proposals list page
  ipfs-preview.governance.tsx        # IPFS metadata preview
  v3/proposal/index.governance.tsx   # Proposal detail page
```
