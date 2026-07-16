import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Avatar, Box, Button, Paper, Skeleton, SvgIcon, Typography } from '@mui/material';
import { ReactNode, useState } from 'react';
import { Link } from 'src/components/primitives/Link';
import { textCenterEllipsis } from 'src/helpers/text-center-ellipsis';
import { getSeatbeltReportUrl } from 'src/modules/governance/utils/seatbelt';
import { ProposalPayload } from 'src/services/governance-cache-sdk';
import { networkConfigs } from 'src/ui-config/networksConfig';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

interface ProposalPayloadsProps {
  payloads?: ProposalPayload[];
  loading?: boolean;
}

const getNetworkName = (chainId: number) =>
  networkConfigs[chainId as keyof typeof networkConfigs]?.name || `Chain ${chainId}`;
const getNetworkLogo = (chainId: number) =>
  networkConfigs[chainId as keyof typeof networkConfigs]?.networkLogoPath;

const ACCESS_LEVEL_LABEL: Record<number, string> = {
  1: 'Minor (Level 1)',
  2: 'Core (Level 2)',
};

const STATE_COLOR: Record<string, string> = {
  created: 'text.secondary',
  queued: 'warning.main',
  executed: 'success.main',
  cancelled: 'error.main',
  expired: 'error.main',
};

const COLLAPSED_COUNT = 2;

const explorerAddressLink = (chainId: number, address: string): string | undefined => {
  try {
    return getNetworkConfig(chainId).explorerLinkBuilder({ address });
  } catch {
    return undefined;
  }
};

const AddressRow = ({
  label,
  chainId,
  address,
}: {
  label: ReactNode;
  chainId: number;
  address: string | null;
}) => {
  if (!address) return null;
  const href = explorerAddressLink(chainId, address);
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      {href ? (
        <Link href={href} sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <Typography variant="caption" color="primary">
            {textCenterEllipsis(address, 6, 4)}
          </Typography>
          <SvgIcon sx={{ fontSize: 12, ml: 0.5, color: 'primary.main' }}>
            <ExternalLinkIcon />
          </SvgIcon>
        </Link>
      ) : (
        <Typography variant="caption">{textCenterEllipsis(address, 6, 4)}</Typography>
      )}
    </Box>
  );
};

export const ProposalPayloads = ({ payloads, loading }: ProposalPayloadsProps) => {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>
        <Skeleton height={120} />
      </Paper>
    );
  }

  if (!payloads || payloads.length === 0) return null;

  const hasMore = payloads.length > COLLAPSED_COUNT;
  const visiblePayloads = expanded ? payloads : payloads.slice(0, COLLAPSED_COUNT);

  return (
    <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>
      <Typography variant="h3" sx={{ mb: 4 }}>
        <Trans>Payloads</Trans>
      </Typography>

      {visiblePayloads.map((p) => {
        const reportUrl = getSeatbeltReportUrl(p);
        const logo = getNetworkLogo(p.chainId);
        return (
          <Box
            key={`${p.chainId}-${p.payloadsController}-${p.payloadId}`}
            sx={{
              py: 3,
              '&:not(:last-of-type)': {
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {logo && <Avatar src={logo} sx={{ width: 20, height: 20, mr: 2 }} />}
                <Typography variant="main14">
                  <Trans>Payload {p.payloadId}</Trans>
                </Typography>
                <Typography variant="caption" color="text.muted" sx={{ ml: 2 }}>
                  {getNetworkName(p.chainId)}
                </Typography>
              </Box>
              <Typography
                variant="subheader2"
                sx={{
                  color: STATE_COLOR[p.state] ?? 'text.secondary',
                  textTransform: 'capitalize',
                }}
              >
                {p.state.replace('_', ' ')}
              </Typography>
            </Box>

            {p.maximumAccessLevelRequired != null && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  <Trans>Access level</Trans>
                </Typography>
                <Typography variant="caption">
                  {ACCESS_LEVEL_LABEL[p.maximumAccessLevelRequired] ??
                    `Level ${p.maximumAccessLevelRequired}`}
                </Typography>
              </Box>
            )}

            <AddressRow label={<Trans>Creator</Trans>} chainId={p.chainId} address={p.creator} />
            <AddressRow
              label={<Trans>Controller</Trans>}
              chainId={p.chainId}
              address={p.payloadsController}
            />

            {p.actions.map((action, i) => (
              <AddressRow
                key={`${action.target}-${i}`}
                label={p.actions.length > 1 ? <Trans>Target {i + 1}</Trans> : <Trans>Target</Trans>}
                chainId={p.chainId}
                address={action.target}
              />
            ))}

            {reportUrl && (
              <Link href={reportUrl} sx={{ display: 'inline-flex', alignItems: 'center', mt: 2 }}>
                <Typography variant="caption" color="primary">
                  <Trans>Seatbelt report</Trans>
                </Typography>
                <SvgIcon sx={{ fontSize: 12, ml: 0.5, color: 'primary.main' }}>
                  <ExternalLinkIcon />
                </SvgIcon>
              </Link>
            )}
          </Box>
        );
      })}

      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button variant="text" size="small" onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? (
              <Trans>Show less</Trans>
            ) : (
              <Trans>Show {payloads.length - COLLAPSED_COUNT} more</Trans>
            )}
          </Button>
        </Box>
      )}
    </Paper>
  );
};
