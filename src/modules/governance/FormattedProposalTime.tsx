import { ProposalState } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';

dayjs.extend(relativeTime);

interface FormattedProposalTimeProps {
  state: ProposalState;
  startTimestamp: number;
  executionTime: number;
  expirationTimestamp: number;
  executionTimeWithGracePeriod: number;
  l2Execution: boolean;
}

export function FormattedProposalTime({
  state,
  executionTime,
  startTimestamp,
  expirationTimestamp,
  // executionTimeWithGracePeriod,
  l2Execution,
}: FormattedProposalTimeProps) {
  const timestamp = useCurrentTimestamp(30);
  const twoDayDelay = 172800;
  // const oneDayDelay = 86400;

  const executionTimeWithL2 = executionTime + twoDayDelay;

  const crossChainExecutionTime = l2Execution ? executionTimeWithL2 : executionTime;
  const canBeExecuted = timestamp > crossChainExecutionTime;

  console.log('PROPOSAL STATE', state);

  if ([ProposalState.Pending].includes(state)) {
    return (
      <Typography component="span" variant="caption">
        <Typography variant="caption" color="text.secondary" sx={{ display: { md: 'inline' } }}>
          {/* {state}&nbsp; */}
          <Trans>Voting starts</Trans>
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
          sx={{ display: { xs: 'inline', md: 'inline' } }}
        >
          <Trans>Voting ends</Trans>
          &nbsp;
        </Typography>
        {dayjs.unix(expirationTimestamp).fromNow()}
      </Typography>
    );
  }

  // Note: We default 1 day from today to assume execution
  if ([ProposalState.Succeeded].includes(state)) {
    return (
      <Typography component="span" variant="caption">
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: 'inline', md: 'inline' } }}
        >
          <Trans> Expected execution on</Trans>
          &nbsp;
        </Typography>
        {dayjs.unix(timestamp + expirationTimestamp).format('MMM DD, YYYY')}
      </Typography>
    );
  }

  if ([ProposalState.Queued].includes(state)) {
    console.log('FSDSDS');
    return (
      <Typography component="span" variant="caption">
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: 'inline', md: 'inline' } }}
        >
          <Trans> Expected execution on</Trans>
          &nbsp;
        </Typography>
        {/* {dayjs.unix(timestamp + expirationTimestamp).format('MMM DD, YYYY')} */}

        {dayjs.unix(executionTime).fromNow()}
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
    ].includes(state) &&
    !l2Execution
  ) {
    return (
      <Typography component="span" variant="caption">
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: 'inline', md: 'inline' } }}
        >
          {state}&nbsp;
          <Trans>on</Trans>
          &nbsp;
        </Typography>

        {dayjs
          .unix(state === ProposalState.Executed ? executionTime : expirationTimestamp)
          .format('MMM DD, YYYY')}
      </Typography>
    );
  }

  // For cross chain

  return (
    <Typography component="span" variant="caption">
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: { xs: 'inline', md: 'inline' } }}
      >
        {canBeExecuted ? (
          l2Execution ? (
            <Trans>Executed cross chain</Trans>
          ) : (
            <Trans>Can be executed cross chain</Trans>
          )
        ) : l2Execution ? (
          <Trans>Can be executed cross chain</Trans>
        ) : (
          <Trans>Executed on</Trans>
        )}
        &nbsp;
      </Typography>

      {dayjs.unix(executionTimeWithL2).format('MMM DD, YYYY')}
    </Typography>
  );
}
