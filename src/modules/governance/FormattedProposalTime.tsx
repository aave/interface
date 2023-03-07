import { ProposalState } from '@aave/contract-helpers';
import { AaveGovernanceV2 } from '@bgd-labs/aave-address-book';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';

dayjs.extend(relativeTime);

interface FormattedProposalTimeProps {
  targets: string[];
  state: ProposalState;
  startTimestamp: number;
  executionTime: number;
  expirationTimestamp: number;
  executionTimeWithGracePeriod: number;
}

export function FormattedProposalTime({
  targets,
  state,
  executionTime,
  startTimestamp,
  expirationTimestamp,
  executionTimeWithGracePeriod,
}: FormattedProposalTimeProps) {
  const timestamp = useCurrentTimestamp(30);

  const delayedBridgeExecutors = [
    AaveGovernanceV2.CROSSCHAIN_FORWARDER_ARBITRUM,
    AaveGovernanceV2.CROSSCHAIN_FORWARDER_OPTIMISM,
    AaveGovernanceV2.CROSSCHAIN_FORWARDER_POLYGON,
  ];

  let exectutionTimeStamp = 0;

  if (targets && targets.length > 0) {
    const hasDelayedExecutor = targets.filter((address) =>
      delayedBridgeExecutors.includes(address)
    );
    if (hasDelayedExecutor.length > 0) {
      exectutionTimeStamp = executionTime + 172800; // Adds time for cross bridge execution
    }
  } else {
    exectutionTimeStamp = executionTime; // normal execution time
  }

  if ([ProposalState.Pending].includes(state)) {
    return (
      <Typography component="span" variant="caption">
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'inline' } }}
        >
          {state}&nbsp;
          <Trans>starts</Trans>
          &nbsp;
        </Typography>
        {dayjs.unix(startTimestamp).fromNow()}
      </Typography>
    );
  }
  if ([ProposalState.Active].includes(state)) {
    return (
      <Typography component="span" variant="caption">
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'inline' } }}
        >
          {state}&nbsp;
          <Trans>ends</Trans>
          &nbsp;
        </Typography>
        {dayjs.unix(expirationTimestamp).fromNow()}
      </Typography>
    );
  }
  if (
    [
      ProposalState.Canceled,
      ProposalState.Expired,
      ProposalState.Failed,
      ProposalState.Succeeded,
      ProposalState.Executed,
    ].includes(state)
  ) {
    return (
      <Typography component="span" variant="caption">
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'inline' } }}
        >
          {state}&nbsp;
          <Trans>on</Trans>
          &nbsp;
        </Typography>
        {dayjs
          .unix(state === ProposalState.Executed ? exectutionTimeStamp : expirationTimestamp)
          .format('MMM DD, YYYY')}
      </Typography>
    );
  }
  const canBeExecuted = timestamp > exectutionTimeStamp;
  return (
    <Typography component="span" variant="caption">
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: { xs: 'none', md: 'inline' } }}
      >
        {canBeExecuted ? <Trans>Expires</Trans> : <Trans>Can be executed</Trans>}
        &nbsp;
      </Typography>
      {dayjs.unix(canBeExecuted ? executionTimeWithGracePeriod : exectutionTimeStamp).fromNow()}
    </Typography>
  );
}
