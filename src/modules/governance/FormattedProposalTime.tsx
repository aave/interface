import { ProposalState } from '@aave/contract-helpers';
import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface FormattedProposalTimeProps {
  state: ProposalState;
  executionTime: string;
  expirationTimestamp: number;
}

export function FormattedProposalTime({
  state,
  executionTime,
  expirationTimestamp,
}: FormattedProposalTimeProps) {
  return (
    <Typography component="span" variant="caption">
      {state}&nbsp;
      {expirationTimestamp &&
        [ProposalState.Active, ProposalState.Queued, ProposalState.Pending].includes(state) &&
        `ends ${dayjs.unix(expirationTimestamp).fromNow()}`}
      {expirationTimestamp &&
        [
          ProposalState.Canceled,
          ProposalState.Expired,
          ProposalState.Failed,
          ProposalState.Succeeded,
        ].includes(state) &&
        `on ${dayjs(expirationTimestamp * 1000).format('MMM DD, YYYY')}`}
      {state === ProposalState.Executed &&
        `on ${dayjs(+executionTime * 1000).format('MMM DD, YYYY')}`}
    </Typography>
  );
}
