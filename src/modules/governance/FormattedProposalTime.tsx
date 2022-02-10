import { ChainId, ProposalState } from '@aave/contract-helpers';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect, useState } from 'react';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

dayjs.extend(relativeTime);

interface FormattedProposalTimeProps {
  state: ProposalState;
  executionTime: string;
  startBlock: number;
  endBlock: number;
  // proposalCreated: number;
}

const averageBlockTime = 13.5;

export function FormattedProposalTime({
  state,
  executionTime,
  startBlock,
  endBlock,
}: // proposalCreated,
FormattedProposalTimeProps) {
  const [expirationTimestamp, setExpirationTimestamp] = useState<number>();

  useEffect(() => {
    async function fetchDate() {
      const provider = getProvider(ChainId.mainnet);
      const { timestamp: startTimestamp } = await provider.getBlock(startBlock);
      // const { timestamp: creationTimestamp } = await provider.getBlock(proposalCreated);
      setExpirationTimestamp(startTimestamp + (endBlock - startBlock) * averageBlockTime);
    }
    if (state !== ProposalState.Executed && !expirationTimestamp) fetchDate();
  }, [state, startBlock, endBlock, expirationTimestamp]);
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
