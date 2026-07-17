import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Collapse,
  Link,
  Paper,
  Skeleton,
  SvgIcon,
  Theme,
  Typography,
  useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { ProposalDetail, ProposalPayload } from 'src/services/GovernanceCacheService';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { networkConfigs } from 'src/ui-config/networksConfig';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

// NOTE: Parallel, experimental timeline shown alongside ProposalLifecycleCache so the single-spine
// design can be compared. It weaves the three state machines (proposal core, voting machine,
// per-chain payloads) onto one line: each step is the milestone (date / live countdown / "ready"
// action) and every underlying on-chain transaction is a substep written in plain language.
//
// Countdowns fully derivable today: the creation cooldown and the voting window. The proposal
// execution timelock (needs GovernanceCore.cooldownPeriod) and the payload timelock/grace (needs
// payload delay/gracePeriod, not yet exposed by getProposalPayloads) degrade to a plain
// "ready/awaiting" label. Transaction links wait on the cache exposing tx hashes — see TODOs.

const getNetworkLogo = (chainId?: number) =>
  chainId != null
    ? networkConfigs[chainId as keyof typeof networkConfigs]?.networkLogoPath
    : undefined;

// Block-explorer link for a transaction. TODO: real hash comes from the cache once
// getProposalDetail/getProposalPayloads expose tx_hash; until then we link to the chain's
// explorer (or Etherscan) as a placeholder.
const explorerBase = (chainId?: number): string => {
  if (chainId != null) {
    try {
      return getNetworkConfig(chainId).explorerLink || 'https://etherscan.io';
    } catch {
      // fall through to default
    }
  }
  return 'https://etherscan.io';
};
const txExplorerLink = (chainId?: number, txHash?: string): string => {
  const base = explorerBase(chainId);
  return txHash ? `${base}/tx/${txHash}` : base;
};

// Placeholders for timelocks the cache doesn't expose yet, used only to render the countdown shape.
// TODO: proposal → GovernanceCore.cooldownPeriod; payload → executor delay (payload_snapshots).
const PLACEHOLDER_EXECUTION_TIMELOCK_SECONDS = 86400; // proposal Queued → Executed
const PLACEHOLDER_PAYLOAD_TIMELOCK_SECONDS = 86400; // payload Queued → Executed

type StepStatus = 'done' | 'now' | 'pending' | 'ok' | 'settled' | 'terminal';

const DATE_FORMAT = 'MMM D, YYYY h:mm A';
const fmtIso = (iso: string | null) => (iso ? dayjs(iso).format(DATE_FORMAT) : null);
const fmtUnix = (unix: string | number | null) =>
  unix != null && `${unix}` !== '0' ? dayjs.unix(Number(unix)).format(DATE_FORMAT) : null;
const isoToUnix = (iso: string | null) => (iso ? Math.floor(new Date(iso).getTime() / 1000) : null);
// Approximate (projected) date, prefixed so it reads as an estimate, not a confirmed time.
const fmtEstimate = (unix: number | null): string | null =>
  unix != null ? `~${dayjs.unix(unix).format(DATE_FORMAT)}` : null;

/** Human "2d 4h" / "7h 20m" / "12m" from a positive second delta. Returns null when elapsed. */
const fmtRemaining = (seconds: number): string | null => {
  if (seconds <= 0) return null;
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return '<1m';
};

interface SubRow {
  key: string;
  chainId?: number;
  label: ReactNode; // human-readable description of the transaction / payload
  value: ReactNode; // date, "Ready to execute", "pending", etc.
  tone?: 'ready' | 'done' | 'wait' | 'countdown' | 'estimate';
  txHash?: string; // when present, the row links to the block explorer
}

interface Step {
  key: string;
  name: ReactNode;
  status: StepStatus;
  value: ReactNode; // right-aligned: date, countdown, ready badge, or config
  valueKind?: 'date' | 'countdown' | 'ready' | 'count' | 'pending' | 'estimate';
  subRows?: SubRow[]; // transactions / per-chain breakdown (collapsible)
}

const statusColor = (status: StepStatus, theme: Theme) => {
  switch (status) {
    case 'done':
      return theme.palette.primary.main;
    case 'ok':
      return theme.palette.success.main;
    case 'now':
    case 'settled':
      return theme.palette.warning.main;
    case 'terminal':
      return theme.palette.error.main;
    default:
      return theme.palette.text.disabled;
  }
};

interface ProposalTimelineProps {
  proposal?: ProposalDetail | null;
  payloads?: ProposalPayload[];
  payloadsLoading?: boolean;
}

export const ProposalTimeline = ({
  proposal,
  payloads,
  payloadsLoading,
}: ProposalTimelineProps) => {
  const theme = useTheme();
  const coreChainId = governanceV3Config.coreChainId;
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [open, setOpen] = useState<Record<string, boolean>>({});

  // Keep countdowns live without re-rendering every second.
  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 15000);
    return () => clearInterval(t);
  }, []);

  const steps = useMemo<Step[]>(() => {
    if (!proposal) return [];
    const p = proposal;
    const list = payloads ?? [];
    const state = p.state;
    // Expired is terminal: any step that never happened won't happen, so don't project a future
    // date for it (that would contradict the expired outcome) — show a neutral dash instead.
    const isExpired = state === 'expired';

    // Forward-projected anchors: use the real timestamp when we have it, otherwise estimate the
    // earliest each milestone could happen by chaining the known durations. Bridge/tx latency is
    // ignored, so these are lower-bound approximations (shown with a "~" prefix).
    //
    // Projected (not-yet-real) anchors are floored at `now`: if a step is already ready but still
    // waiting on someone to send its permissionless tx, its natural projection is in the past — the
    // realistic earliest it (and everything after it) can happen is now, so we clamp and cascade.
    const clampFuture = (t: number | null) => (t == null ? null : Math.max(t, now));
    const createdUnix = isoToUnix(p.createdAt);
    const cooldown = p.cooldownBeforeVotingStart ?? 0;
    const votingDur = p.votingDuration ? Number(p.votingDuration) : 0;

    const votingOpensAt = createdUnix != null ? createdUnix + cooldown : null;
    const projVotingStart = p.votingStartTime
      ? Number(p.votingStartTime)
      : clampFuture(votingOpensAt);
    const votingEnd = p.votingEndTime
      ? Number(p.votingEndTime)
      : projVotingStart != null
      ? projVotingStart + votingDur
      : null;
    const projQueued = isoToUnix(p.queuedAt) ?? clampFuture(votingEnd);
    const projExecuted =
      isoToUnix(p.executedAt) ??
      clampFuture(projQueued != null ? projQueued + PLACEHOLDER_EXECUTION_TIMELOCK_SECONDS : null);
    // Payloads are received ~when the proposal executes, then run after their own timelock.
    const projPayloadExec = clampFuture(
      projExecuted != null ? projExecuted + PLACEHOLDER_PAYLOAD_TIMELOCK_SECONDS : null
    );

    const out: Step[] = [];

    // 1 — Created (transactions: each payload created + the proposal itself)
    out.push({
      key: 'created',
      name: <Trans>Created</Trans>,
      status: p.createdAt ? 'done' : 'pending',
      value: fmtIso(p.createdAt) ?? <Trans>Pending</Trans>,
      valueKind: 'date',
      subRows: [
        ...list.map((pl) => ({
          key: `c-${pl.chainId}-${pl.payloadId}`,
          chainId: pl.chainId,
          label: <Trans>Payload {pl.payloadId} created</Trans>,
          value: fmtIso(pl.createdAt) ?? '—',
          tone: 'done' as const,
        })),
        {
          key: 'c-proposal',
          chainId: coreChainId,
          label: <Trans>Proposal created</Trans>,
          value: fmtIso(p.createdAt) ?? '—',
          tone: 'done' as const,
        },
      ],
    });

    // 2 — Open for voting (tx: activateVoting)
    if (p.votingActivatedAt || p.votingStartTime) {
      out.push({
        key: 'voting-open',
        name: <Trans>Open for voting</Trans>,
        status: 'done',
        value: fmtIso(p.votingActivatedAt) ?? fmtUnix(p.votingStartTime) ?? '—',
        valueKind: 'date',
        subRows: [
          {
            key: 'tx-activate',
            chainId: coreChainId,
            label: <Trans>Voting activated</Trans>,
            value: fmtIso(p.votingActivatedAt) ?? fmtUnix(p.votingStartTime) ?? '—',
            tone: 'done',
          },
        ],
      });
    } else if (state === 'created') {
      const remaining = votingOpensAt != null ? fmtRemaining(votingOpensAt - now) : null;
      out.push({
        key: 'voting-open',
        name: <Trans>Open for voting</Trans>,
        status: 'now',
        value: remaining ? `opens in ${remaining}` : 'Ready to activate',
        valueKind: remaining ? 'countdown' : 'ready',
      });
    } else {
      out.push({
        key: 'voting-open',
        name: <Trans>Open for voting</Trans>,
        status: 'pending',
        value: fmtEstimate(projVotingStart) ?? <Trans>Pending</Trans>,
        valueKind: 'estimate',
      });
    }

    // 3 — Voting closed (tx: closeAndSendVote, then bridged back)
    const votingDone = ['queued', 'executed', 'partially_executed', 'expired', 'failed'].includes(
      state
    );
    if (votingDone) {
      out.push({
        key: 'voting-closed',
        name: <Trans>Voting closed</Trans>,
        status: 'done',
        value: fmtUnix(p.votingEndTime) ?? '—',
        valueKind: 'date',
        subRows: [
          {
            key: 'tx-close',
            label: <Trans>Votes tallied and sent to governance</Trans>,
            value: fmtUnix(p.votingEndTime) ?? '—',
            tone: 'done',
          },
        ],
      });
    } else if (state === 'active') {
      const remaining = votingEnd != null ? fmtRemaining(votingEnd - now) : null;
      out.push({
        key: 'voting-closed',
        name: <Trans>Voting closes</Trans>,
        status: 'now',
        value: remaining ? `in ${remaining}` : 'Ready to close',
        valueKind: remaining ? 'countdown' : 'ready',
      });
    } else {
      out.push({
        key: 'voting-closed',
        name: <Trans>Voting closed</Trans>,
        status: 'pending',
        value: fmtEstimate(votingEnd) ?? <Trans>Pending</Trans>,
        valueKind: 'estimate',
      });
    }

    // Terminal branches short-circuit the rest.
    if (state === 'cancelled') {
      out.push({
        key: 'cancelled',
        name: <Trans>Cancelled</Trans>,
        status: 'terminal',
        value: fmtIso(p.cancelledAt) ?? '—',
        valueKind: 'date',
        subRows: [
          {
            key: 'tx-cancel',
            chainId: coreChainId,
            label: <Trans>Proposal cancelled</Trans>,
            value: fmtIso(p.cancelledAt) ?? '—',
            tone: 'done',
          },
        ],
      });
      return out;
    }
    if (state === 'failed') {
      out.push({
        key: 'failed',
        name: <Trans>Failed</Trans>,
        status: 'terminal',
        value: fmtIso(p.failedAt) ?? '—',
        valueKind: 'date',
      });
      return out;
    }

    // 4 — Queued (automatic: the bridged result queues the proposal)
    out.push({
      key: 'queued',
      name: <Trans>Queued</Trans>,
      status: p.queuedAt ? 'done' : 'pending',
      value: p.queuedAt
        ? fmtIso(p.queuedAt) ?? '—'
        : isExpired
        ? '—'
        : fmtEstimate(projQueued) ?? <Trans>after voting</Trans>,
      valueKind: p.queuedAt ? 'date' : isExpired ? 'pending' : 'estimate',
      subRows: p.queuedAt
        ? [
            {
              key: 'tx-queue',
              chainId: coreChainId,
              label: <Trans>Queued for execution</Trans>,
              value: fmtIso(p.queuedAt) ?? '—',
              tone: 'done',
            },
          ]
        : undefined,
    });

    // 5 — Executed (tx: executeProposal → dispatches payloads)
    if (p.executedAt) {
      out.push({
        key: 'executed',
        name: <Trans>Executed</Trans>,
        status: 'done',
        value: fmtIso(p.executedAt) ?? '—',
        valueKind: 'date',
        subRows: [
          {
            key: 'tx-execute',
            chainId: coreChainId,
            label: <Trans>Payloads dispatched to execution chains</Trans>,
            value: fmtIso(p.executedAt) ?? '—',
            tone: 'done',
          },
        ],
      });
    } else if (state === 'queued') {
      // Execution timelock: executable at queuedAt + COOLDOWN_PERIOD.
      // TODO: real value is GovernanceCore.cooldownPeriod (on-chain immutable, not in cache) —
      // using a placeholder until it's exposed.
      const queuedUnix = isoToUnix(p.queuedAt);
      const executableAt =
        queuedUnix != null ? queuedUnix + PLACEHOLDER_EXECUTION_TIMELOCK_SECONDS : null;
      const remaining = executableAt != null ? fmtRemaining(executableAt - now) : null;
      out.push({
        key: 'executed',
        name: remaining ? <Trans>Executes</Trans> : <Trans>Executed</Trans>,
        status: 'now',
        value: remaining ? `in ${remaining}` : 'Ready to execute',
        valueKind: remaining ? 'countdown' : 'ready',
      });
    } else {
      out.push({
        key: 'executed',
        name: <Trans>Executed</Trans>,
        status: 'pending',
        value: isExpired ? '—' : fmtEstimate(projExecuted) ?? <Trans>Pending</Trans>,
        valueKind: isExpired ? 'pending' : 'estimate',
      });
    }

    // 6 — Payloads queued (per chain, received via bridge)
    if (list.length) {
      const anyQueued = list.some((pl) => pl.queuedAt);
      out.push({
        key: 'payloads-queued',
        name: <Trans>Payloads queued</Trans>,
        status: anyQueued ? 'done' : 'pending',
        value: anyQueued
          ? fmtIso(
              list
                .map((pl) => pl.queuedAt)
                .filter(Boolean)
                .sort()[0] ?? null
            ) ?? '—'
          : isExpired
          ? '—'
          : fmtEstimate(projExecuted) ?? ((<Trans>after execution</Trans>) as ReactNode),
        valueKind: anyQueued ? 'date' : isExpired ? 'pending' : 'estimate',
        subRows: list.map((pl) => ({
          key: `q-${pl.chainId}-${pl.payloadId}`,
          chainId: pl.chainId,
          label: <Trans>Payload {pl.payloadId} received</Trans>,
          value: pl.queuedAt
            ? fmtIso(pl.queuedAt) ?? '—'
            : isExpired
            ? '—'
            : fmtEstimate(projExecuted) ?? 'pending',
          tone: pl.queuedAt ? ('done' as const) : ('estimate' as const),
        })),
      });

      // 7 — Payloads executed (per chain; ready/countdown per payload)
      const executed = list.filter((pl) => pl.state === 'executed').length;
      const expiredCount = list.filter((pl) => pl.state === 'expired').length;
      const cancelledCount = list.filter((pl) => pl.state === 'cancelled').length;
      const allExecuted = executed === list.length;
      // Settled = every payload reached a terminal state (executed / expired / cancelled).
      // All executed → green (clean success); settled but some cancelled/expired → solid yellow;
      // still waiting → hollow.
      const settled = list.every((pl) => ['executed', 'expired', 'cancelled'].includes(pl.state));

      // Before anything is queued, a raw "0 / N executed" reads as a failure — show the payload
      // count instead. Once settled with some that didn't execute, spell out why.
      let executedValue: string;
      if (!anyQueued) {
        executedValue = `${list.length} payload${list.length === 1 ? '' : 's'}`;
      } else {
        const failures = [
          expiredCount ? `${expiredCount} expired` : null,
          cancelledCount ? `${cancelledCount} cancelled` : null,
        ].filter(Boolean);
        executedValue = `${executed} / ${list.length} executed${
          failures.length ? ` · ${failures.join(', ')}` : ''
        }`;
      }

      out.push({
        key: 'payloads-executed',
        // "finalized" when settled with some that didn't execute (expired/cancelled), so the yellow
        // "0 / N executed" isn't mistaken for still-running.
        name:
          settled && !allExecuted ? (
            <Trans>Payloads finalized</Trans>
          ) : (
            <Trans>Payloads executed</Trans>
          ),
        status: allExecuted ? 'ok' : settled ? 'settled' : anyQueued ? 'now' : 'pending',
        value: executedValue,
        valueKind: 'count',
        subRows: list.map((pl) => {
          let value: ReactNode = fmtEstimate(projPayloadExec) ?? 'pending';
          let tone: SubRow['tone'] = 'estimate';
          if (pl.state === 'executed') {
            value = fmtIso(pl.executedAt) ?? 'executed';
            tone = 'done';
          } else if (pl.state === 'cancelled') {
            value = 'cancelled';
            tone = 'wait';
          } else if (pl.state === 'expired') {
            value = 'expired';
            tone = 'wait';
          } else if (pl.state === 'queued') {
            // Payload timelock: executable at queuedAt + delay. TODO: real delay/gracePeriod come
            // from payload_snapshots (not yet exposed) — placeholder renders the countdown shape.
            const qUnix = isoToUnix(pl.queuedAt);
            const execAt = qUnix != null ? qUnix + PLACEHOLDER_PAYLOAD_TIMELOCK_SECONDS : null;
            const remaining = execAt != null ? fmtRemaining(execAt - now) : null;
            value = remaining ? `in ${remaining}` : 'Ready to execute';
            tone = remaining ? 'countdown' : 'ready';
          }
          return {
            key: `e-${pl.chainId}-${pl.payloadId}`,
            chainId: pl.chainId,
            label: <Trans>Payload {pl.payloadId} executed</Trans>,
            value,
            tone,
          };
        }),
      });
    }

    return out;
  }, [proposal, payloads, now, coreChainId]);

  if (!proposal || payloadsLoading) {
    return (
      <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>
        <Skeleton height={220} />
      </Paper>
    );
  }

  const renderSubRow = (sub: SubRow) => {
    // Only completed transactions get a link (pending / ready rows haven't happened on-chain).
    const showLink = sub.tone === 'done' || !!sub.txHash;
    const href = showLink ? txExplorerLink(sub.chainId, sub.txHash) : undefined;
    const logo = getNetworkLogo(sub.chainId);
    return (
      <Box
        key={sub.key}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {logo && <Avatar src={logo} sx={{ width: 16, height: 16 }} />}
        <Typography variant="caption" sx={{ color: 'text.primary' }}>
          {sub.label}
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: sub.tone === 'ready' ? 700 : sub.tone === 'countdown' ? 600 : 400,
              fontStyle: sub.tone === 'estimate' ? 'italic' : 'normal',
              color:
                sub.tone === 'ready' || sub.tone === 'countdown'
                  ? 'warning.main'
                  : sub.tone === 'done'
                  ? 'text.muted'
                  : sub.tone === 'estimate'
                  ? 'text.muted'
                  : 'text.secondary',
              whiteSpace: 'nowrap',
            }}
          >
            {sub.value}
          </Typography>
          {href && (
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'inline-flex' }}
            >
              <SvgIcon sx={{ fontSize: 12, color: 'primary.main' }}>
                <ExternalLinkIcon />
              </SvgIcon>
            </Link>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>
      <Typography variant="h3" sx={{ mb: 4 }}>
        <Trans>Timeline</Trans>
      </Typography>

      <Box>
        {steps.map((step, i) => {
          const color = statusColor(step.status, theme);
          const isLast = i === steps.length - 1;
          const hasSubs = !!step.subRows?.length;
          const isOpen = !!open[step.key];
          return (
            <Box key={step.key} sx={{ position: 'relative', pl: 8, pb: isLast ? 0 : 3 }}>
              {/* spine */}
              {!isLast && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: '5px',
                    top: '18px',
                    bottom: 0,
                    width: '2px',
                    bgcolor:
                      step.status === 'done' || step.status === 'ok' ? 'primary.main' : 'divider',
                  }}
                />
              )}
              {/* dot */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: '4px',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  border: `2.5px solid ${color}`,
                  bgcolor:
                    step.status === 'done' ||
                    step.status === 'ok' ||
                    step.status === 'settled' ||
                    step.status === 'terminal'
                      ? color
                      : theme.palette.background.paper,
                  boxShadow:
                    step.status === 'now'
                      ? `0 0 0 4px ${theme.palette.background.paper}, 0 0 0 6px ${theme.palette.warning.main}33`
                      : undefined,
                }}
              />

              {/* header row */}
              <Box
                role={hasSubs ? 'button' : undefined}
                tabIndex={hasSubs ? 0 : undefined}
                aria-expanded={hasSubs ? isOpen : undefined}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: hasSubs ? 'pointer' : 'default',
                  '&:focus-visible': {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2,
                    borderRadius: 1,
                  },
                }}
                onClick={
                  hasSubs ? () => setOpen((o) => ({ ...o, [step.key]: !o[step.key] })) : undefined
                }
                onKeyDown={
                  hasSubs
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setOpen((o) => ({ ...o, [step.key]: !o[step.key] }));
                        }
                      }
                    : undefined
                }
              >
                <Typography
                  variant="main14"
                  sx={{ color: step.status === 'pending' ? 'text.secondary' : 'text.primary' }}
                >
                  {step.name}
                </Typography>

                {hasSubs && (
                  <Box sx={{ color: 'text.muted', display: 'flex' }}>
                    {isOpen ? (
                      <KeyboardArrowUp sx={{ fontSize: 16 }} />
                    ) : (
                      <KeyboardArrowDown sx={{ fontSize: 16 }} />
                    )}
                  </Box>
                )}

                <Box sx={{ ml: 'auto' }}>
                  {step.valueKind === 'ready' ? (
                    <Typography
                      variant="caption"
                      sx={{
                        px: 1.5,
                        py: 0.25,
                        borderRadius: 4,
                        bgcolor: 'warning.main',
                        color: 'common.white',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {step.value}
                    </Typography>
                  ) : step.valueKind === 'count' ? (
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color:
                          step.status === 'ok'
                            ? 'success.main'
                            : step.status === 'pending'
                            ? 'text.muted'
                            : 'warning.main',
                      }}
                    >
                      {step.value}
                    </Typography>
                  ) : (
                    <Typography
                      variant="caption"
                      sx={{
                        color:
                          step.valueKind === 'countdown'
                            ? 'warning.main'
                            : step.valueKind === 'pending'
                            ? 'text.disabled'
                            : 'text.muted',
                        fontWeight: step.valueKind === 'countdown' ? 600 : 400,
                        fontStyle:
                          step.valueKind === 'pending' || step.valueKind === 'estimate'
                            ? 'italic'
                            : 'normal',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {step.value}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* collapsible transactions / per-chain sub rows */}
              {hasSubs && (
                <Collapse in={isOpen} unmountOnExit>
                  <Box sx={{ mt: 1.5, px: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {step.subRows?.map((sub) => renderSubRow(sub))}
                  </Box>
                </Collapse>
              )}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};
